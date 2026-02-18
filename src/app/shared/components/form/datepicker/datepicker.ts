import {
  Component,
  input,
  signal,
  inject,
  ChangeDetectionStrategy,
  computed,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { ControlValueAccessor, NgControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@ngneat/transloco';
import { Subscription } from 'rxjs';
import { AppearanceService, LabelPosition } from '../../../../core/services/appearance.service';

@Component({
  selector: 'lib-datepicker',
  standalone: true,
  imports: [CommonModule, DatePickerModule, ReactiveFormsModule, FormsModule, TranslocoPipe],
  templateUrl: './datepicker.html',
  styleUrl: './datepicker.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerComponent implements ControlValueAccessor, OnInit, OnDestroy {
  private appearanceService = inject(AppearanceService);
  private cdr = inject(ChangeDetectorRef);

  label = input<string>('');
  required = input<boolean>(false);
  placeholder = input<string>('');
  hint = input<string>('');
  id = input<string>(`dp-${Math.random().toString(36).substring(2, 11)}`);
  showTime = input<boolean>(false);
  hourFormat = input<'12' | '24'>('24');
  dateFormat = input<string>('dd/mm/yy'); // PrimeNG format
  showIcon = input<boolean>(true);
  labelPosition = input<LabelPosition | undefined>(undefined);

  /**
   * Effective label position based on explicit property or global appearance setting.
   */
  effectiveLabelPosition = computed(
    () => this.labelPosition() ?? this.appearanceService.labelPosition(),
  );

  isDisabled = input<boolean | undefined>(undefined, { alias: 'disabled' });

  value = signal<Date | null>(null);
  private _disabled = signal<boolean>(false);

  /**
   * Effective disabled state based on explicit property or form control state.
   */
  effectiveDisabled = computed(
    () => !!(this.isDisabled() !== undefined ? this.isDisabled() : this._disabled()),
  );

  // Inject NgControl to access validation state
  protected ngControl = inject(NgControl, { optional: true, self: true });

  // Signal to track control state changes
  private controlState = signal<number>(0);
  private statusSub?: Subscription;

  protected errors = computed(() => {
    this.controlState(); // Dependency
    return this.ngControl?.control?.errors || null;
  });

  protected showError = computed(() => {
    this.controlState(); // Dependency
    const control = this.ngControl?.control;

    if (!control) return false;

    return !!(control.invalid && (control.dirty || control.touched));
  });

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit() {
    // Wait for the next tick to ensure control is bound
    setTimeout(() => {
      const control = this.ngControl?.control;
      if (control) {
        this.statusSub = control.statusChanges.subscribe(() => {
          this.controlState.update((n) => n + 1);
          this.cdr.detectChanges();
        });
      }
    });
  }

  ngOnDestroy() {
    this.statusSub?.unsubscribe();
  }

  // ControlValueAccessor methods
  private onModelChange: (value: any) => void = () => {};
  private onModelTouched: () => void = () => {};

  writeValue(value: any): void {
    if (value) {
      // Handle string to Date conversion
      const date = new Date(value);
      this.value.set(isNaN(date.getTime()) ? null : date);
    } else {
      this.value.set(null);
    }
  }

  registerOnChange(fn: any): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onModelTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled.set(isDisabled);
  }

  handleValueChange(date: Date | null): void {
    this.value.set(date);

    if (!date) {
      this.onModelChange(null);
      return;
    }

    // Format for backend
    if (this.showTime()) {
      // ISO format: 2024-02-12T08:30:00Z
      this.onModelChange(date.toISOString());
    } else {
      // Date only: 2024-02-12
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      this.onModelChange(`${year}-${month}-${day}`);
    }
  }

  handleBlur(): void {
    this.onModelTouched();
  }
}
