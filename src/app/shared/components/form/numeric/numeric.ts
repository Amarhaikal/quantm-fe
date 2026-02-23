import {
  Component,
  input,
  signal,
  inject,
  ChangeDetectionStrategy,
  computed,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { ControlValueAccessor, NgControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@ngneat/transloco';
import { Subscription } from 'rxjs';
import { AppearanceService, LabelPosition } from '../../../../core/services/appearance.service';

export type NumericType = 'integer' | 'decimal' | 'percentage' | 'currency';

@Component({
  selector: 'lib-numeric',
  standalone: true,
  imports: [CommonModule, InputNumberModule, ReactiveFormsModule, FormsModule, TranslocoPipe],
  templateUrl: './numeric.html',
  styleUrl: './numeric.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumericComponent implements ControlValueAccessor, OnInit, OnDestroy {
  private appearanceService = inject(AppearanceService);
  private cdr = inject(ChangeDetectorRef);

  label = input<string>('');
  required = input<boolean>(false);
  placeholder = input<string>('');
  hint = input<string>('');
  numericType = input<NumericType>('decimal');
  id = input<string>(`num-${Math.random().toString(36).substring(2, 11)}`);
  currency = input<string>('MYR');
  currencyDisplay = input<'symbol' | 'code' | 'name'>('code');
  locale = input<string>('en-MY');
  minFractionDigits = input<number | undefined>(undefined);
  maxFractionDigits = input<number | undefined>(undefined);
  min = input<number | undefined>(undefined);
  max = input<number | undefined>(undefined);
  labelPosition = input<LabelPosition | undefined>(undefined);
  isTable = input<boolean>(false);

  effectiveLabelPosition = computed(
    () => this.labelPosition() ?? this.appearanceService.labelPosition(),
  );

  // Support for non-form usage
  externalValue = input<number | null | undefined>(undefined, { alias: 'value' });
  isDisabled = input<boolean | undefined>(undefined, { alias: 'disabled' });

  private _value = signal<number | null>(null);
  private _disabled = signal<boolean>(false);

  protected displayValue = computed(() =>
    this.externalValue() !== undefined ? (this.externalValue() ?? null) : this._value(),
  );
  protected effectiveDisabled = computed(
    () => !!(this.isDisabled() !== undefined ? this.isDisabled() : this._disabled()),
  );

  protected ngControl = inject(NgControl, { optional: true, self: true });

  private controlState = signal<number>(0);
  private statusSub?: Subscription;

  protected errors = computed(() => {
    this.controlState();
    return this.ngControl?.control?.errors || null;
  });

  protected showError = computed(() => {
    this.controlState();
    const control = this.ngControl?.control;

    if (!control) return false;

    if (this.isTable()) {
      const value = control.value;
      const isEmpty = value === null || value === undefined || value === '';
      return !!(control.invalid && (isEmpty || control.dirty || control.touched));
    }

    return !!(control.invalid && (control.dirty || control.touched));
  });

  // Computed PrimeNG InputNumber props based on numericType
  protected mode = computed<'decimal' | 'currency'>(() => {
    return this.numericType() === 'currency' ? 'currency' : 'decimal';
  });

  protected suffix = computed<string | undefined>(() => {
    return this.numericType() === 'percentage' ? '%' : undefined;
  });

  protected effectiveMinFractionDigits = computed<number>(() => {
    if (this.minFractionDigits() !== undefined) return this.minFractionDigits()!;
    switch (this.numericType()) {
      case 'integer':
        return 0;
      case 'decimal':
        return 0;
      case 'percentage':
        return 0;
      case 'currency':
        return 2;
    }
  });

  protected effectiveMaxFractionDigits = computed<number>(() => {
    if (this.maxFractionDigits() !== undefined) return this.maxFractionDigits()!;
    switch (this.numericType()) {
      case 'integer':
        return 0;
      case 'decimal':
        return 4;
      case 'percentage':
        return 2;
      case 'currency':
        return 2;
    }
  });

  protected effectiveMin = computed(() => {
    if (this.min() !== undefined) return this.min();
    return this.numericType() === 'percentage' ? 0 : undefined;
  });

  protected effectiveMax = computed(() => {
    if (this.max() !== undefined) return this.max();
    return this.numericType() === 'percentage' ? 100 : undefined;
  });

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit() {
    setTimeout(() => {
      const control = this.ngControl?.control;
      if (control) {
        this.statusSub = control.statusChanges.subscribe(() => {
          this.controlState.update((n) => n + 1);
          this.cdr.detectChanges();
        });
        this.controlState.update((n) => n + 1);
      }
    });
  }

  ngOnDestroy() {
    this.statusSub?.unsubscribe();
  }

  // ControlValueAccessor methods
  onChange: (value: number | null) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: number | null): void {
    this._value.set(value ?? null);
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled.set(isDisabled);
  }

  handleValueChange(value: number | null): void {
    this._value.set(value);
    this.onChange(value);
  }

  handleBlur(): void {
    this.onTouched();
    this.ngControl?.control?.markAsTouched();
    this.cdr.detectChanges();
  }
}
