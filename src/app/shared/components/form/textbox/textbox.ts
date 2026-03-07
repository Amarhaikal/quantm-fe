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
import {
  ControlValueAccessor,
  NgControl,
  ReactiveFormsModule,
  FormsModule,
  Validators,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@ngneat/transloco';
import { Subscription } from 'rxjs';
import { AppearanceService, LabelPosition } from '../../../../core/services/appearance.service';

export type TextboxType = 'text' | 'email' | 'IDNO' | 'PHONENO' | 'REGNO' | 'password';

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
  private appearanceService = inject(AppearanceService);

  label = input<string>('');
  required = input<boolean>(false);
  placeholder = input<string>('');
  hint = input<string>('');
  type = input<TextboxType>('text');
  id = input<string>(`txt-${Math.random().toString(36).substring(2, 11)}`);
  icon = input<string>('');
  minLength = input<number | undefined>(undefined);
  maxLength = input<number | undefined>(undefined);
  patternErrorKey = input<string>('validation.pattern_error');
  labelPosition = input<LabelPosition | undefined>(undefined);
  isSearching = input<boolean>(false);
  isTable = input<boolean>(false);

  /**
   * Effective label position based on explicit property or global appearance setting.
   */
  effectiveLabelPosition = computed(() => {
    if (this.isSearching()) return 'top';
    return this.labelPosition() ?? this.appearanceService.labelPosition();
  });

  // Support for non-form usage (read-only/one-way binding)
  externalValue = input<string | null | undefined>(undefined, { alias: 'value' });
  isDisabled = input<boolean | undefined>(undefined, { alias: 'disabled' });

  private _value = signal<string>('');
  private _disabled = signal<boolean>(false);

  // Use external input if provided, otherwise fallback to internal signal (from ControlValueAccessor)
  protected displayValue = computed(
    () => (this.externalValue() !== undefined ? this.externalValue() : this._value()) || '',
  );
  protected effectiveDisabled = computed(
    () => !!(this.isDisabled() !== undefined ? this.isDisabled() : this._disabled()),
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

    // In table mode, show errors immediately if invalid AND (is empty OR has been interacted with)
    if (this.isTable()) {
      const value = control.value;
      const isEmpty = value === null || value === undefined || value === '';
      return !!(control.invalid && (isEmpty || control.dirty || control.touched));
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
        // Dynamically add minLength/maxLength validators based on inputs
        const extraValidators = [];
        if (this.minLength() !== undefined) {
          extraValidators.push(Validators.minLength(this.minLength()!));
        }
        if (this.maxLength() !== undefined) {
          extraValidators.push(Validators.maxLength(this.maxLength()!));
        }
        if (extraValidators.length) {
          control.addValidators(extraValidators);
          control.updateValueAndValidity();
        }

        this.statusSub = control.statusChanges.subscribe(() => {
          this.controlState.update((n) => n + 1);
          this.cdr.detectChanges();
        });
        // Force re-evaluation of showError with the current control state
        this.controlState.update((n) => n + 1);
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
