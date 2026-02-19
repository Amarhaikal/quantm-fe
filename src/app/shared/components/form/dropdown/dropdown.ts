import {
  Component,
  input,
  signal,
  inject,
  ChangeDetectionStrategy,
  output,
  computed,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { ControlValueAccessor, NgControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@ngneat/transloco';
import { Subscription } from 'rxjs';
import { AppearanceService, LabelPosition } from '../../../../core/services/appearance.service';

export interface OptionDropdown {
  value: string;
  label: string;
}

@Component({
  selector: 'lib-dropdown',
  standalone: true,
  imports: [CommonModule, SelectModule, ReactiveFormsModule, FormsModule, TranslocoPipe],
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.table-mode]': 'isTable()',
  },
})
export class DropdownComponent implements ControlValueAccessor, OnInit, OnDestroy {
  private appearanceService = inject(AppearanceService);
  private cdr = inject(ChangeDetectorRef);

  label = input<string>('');
  required = input<boolean>(false);
  options = input<OptionDropdown[]>([]);
  placeholder = input<string>('');
  hint = input<string>('');
  id = input<string>(`dd-${Math.random().toString(36).substring(2, 11)}`);
  filter = true;
  loading = input<boolean>(false);
  isTable = input<boolean>(false);
  isFocused = signal(false);
  isOpen = signal(false);

  // Show clear button when focused or when the panel is open
  protected shouldShowClear = computed(() => this.isFocused() || this.isOpen());

  labelPosition = input<LabelPosition | undefined>(undefined);

  /**
   * Effective label position based on explicit property or global appearance setting.
   */
  effectiveLabelPosition = computed(
    () => this.labelPosition() ?? this.appearanceService.labelPosition(),
  );

  // Support for non-form usage (read-only/one-way binding)
  externalValue = input<any>(undefined, { alias: 'value' });
  isDisabled = input<boolean | undefined>(undefined, { alias: 'disabled' });

  onChange = output<any>();
  onBlur = output<FocusEvent>();

  private _value = signal<any>(null);
  private _disabled = signal<boolean>(false);

  // Use external input if provided, otherwise fallback to internal signal (from ControlValueAccessor)
  protected displayValue = computed(() =>
    this.externalValue() !== undefined ? this.externalValue() : this._value(),
  );
  protected effectiveDisabled = computed(
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

    // In table mode, show errors immediately if invalid AND (is empty OR has been interacted with)
    if (this.isTable()) {
      const value = control.value;
      const isEmpty = value === null || value === undefined || value === '';
      return !!(control.invalid && (isEmpty || control.dirty || control.touched));
    }

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
        // Force re-evaluation of showError with the current control state
        this.controlState.update((n) => n + 1);
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
    this._value.set(value);
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

  handleValueChange(value: any): void {
    this._value.set(value);
    this.onModelChange(value);
    this.onChange.emit(value);
  }

  handleFocus(): void {
    this.isFocused.set(true);
  }

  handleBlur(event: any): void {
    // Delay hiding the clear button to allow click events to process
    setTimeout(() => {
      this.isFocused.set(false);
    }, 200);
    this.onModelTouched();
    this.onBlur.emit(event);
  }

  handleShow(): void {
    this.isOpen.set(true);
  }

  handleHide(): void {
    this.isOpen.set(false);
  }
}
