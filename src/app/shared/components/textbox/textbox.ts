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
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@ngneat/transloco';
import { Subscription } from 'rxjs';

export type TextboxType = 'text' | 'email' | 'IDNO' | 'PHONENO';

@Component({
  selector: 'lib-textbox',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    InputMaskModule,
    ReactiveFormsModule,
    FormsModule,
    TranslocoPipe,
  ],
  templateUrl: './textbox.html',
  styleUrl: './textbox.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextboxComponent implements ControlValueAccessor, OnInit, OnDestroy {
  label = input<string>('');
  required = input<boolean>(false);
  placeholder = input<string>('');
  hint = input<string>('');
  type = input<TextboxType>('text');
  id = input<string>(`txt-${Math.random().toString(36).substring(2, 11)}`);
  icon = input<string>('');
  maxLength = input<number | undefined>(undefined);
  patternErrorKey = input<string>('validation.pattern_error');

  // Support for non-form usage (read-only/one-way binding)
  externalValue = input<string | null | undefined>(undefined, { alias: 'value' });
  externalDisabled = input<boolean | undefined>(undefined, { alias: 'disabled' });

  private _value = signal<string>('');
  private _disabled = signal<boolean>(false);

  // Use external input if provided, otherwise fallback to internal signal (from ControlValueAccessor)
  protected displayValue = computed(
    () => (this.externalValue() !== undefined ? this.externalValue() : this._value()) || '',
  );
  protected displayDisabled = computed(
    () => !!(this.externalDisabled() !== undefined ? this.externalDisabled() : this._disabled()),
  );
  protected isFocused = signal<boolean>(false);

  // Inject NgControl to access validation state
  protected ngControl = inject(NgControl, { optional: true, self: true });
  private cdr = inject(ChangeDetectorRef);

  // Signal to track control state changes
  private controlState = signal<number>(0);
  private statusSub?: Subscription;

  protected errors = computed(() => {
    this.controlState(); // Dependency
    return this.ngControl?.control?.errors || null;
  });

  protected showError = computed(() => {
    this.controlState(); // Dependency
    const focused = this.isFocused();
    const control = this.ngControl?.control;

    if (!control) return false;

    // Special case: Always show 'notAvailable' error immediately
    if (control.hasError('notAvailable')) {
      return true;
    }

    return !!(control.invalid && (control.dirty || control.touched || focused));
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
  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: any): void {
    this._value.set(value || '');
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled.set(isDisabled);
  }

  handleInput(event: any): void {
    let val = event.target ? event.target.value : event.value ? event.value : event;
    const max = this.maxLength();

    if (max !== undefined && val.length > max + 1) {
      val = val.substring(0, max + 1);
      if (event.target) {
        event.target.value = val;
      }
    }

    this._value.set(val);
    this.onChange(val);
  }

  handleBlur(): void {
    this.isFocused.set(false);
    this.onTouched();
    this.trimValueIfExceeds();
    this.ngControl?.control?.markAsTouched();
    this.cdr.detectChanges();
  }

  handleFocus(): void {
    this.isFocused.set(true);
    this.trimValueIfExceeds();
    this.cdr.detectChanges();
  }

  private trimValueIfExceeds(): void {
    const max = this.maxLength();
    const currentVal = this._value();

    if (max !== undefined && currentVal.length > max) {
      const trimmed = currentVal.substring(0, max);
      this._value.set(trimmed);
      this.onChange(trimmed);
    }
  }
}
