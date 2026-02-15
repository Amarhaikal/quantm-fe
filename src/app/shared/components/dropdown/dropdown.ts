import {
  Component,
  forwardRef,
  input,
  signal,
  inject,
  ChangeDetectionStrategy,
  output,
  computed,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@ngneat/transloco';

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
})
export class DropdownComponent implements ControlValueAccessor {
  label = input<string>('');
  required = input<boolean>(false);
  options = input<OptionDropdown[]>([]);
  placeholder = input<string>('');
  hint = input<string>('');
  id = input<string>(`dd-${Math.random().toString(36).substring(2, 11)}`);
  filter = input<boolean>(true);
  showClear = input<boolean>(true);
  loading = input<boolean>(false);

  // Support for non-form usage (read-only/one-way binding)
  externalValue = input<any>(undefined, { alias: 'value' });
  externalDisabled = input<boolean | undefined>(undefined, { alias: 'disabled' });

  onChange = output<any>();
  onBlur = output<FocusEvent>();

  private _value = signal<any>(null);
  private _disabled = signal<boolean>(false);

  // Use external input if provided, otherwise fallback to internal signal (from ControlValueAccessor)
  protected displayValue = computed(() =>
    this.externalValue() !== undefined ? this.externalValue() : this._value(),
  );
  protected displayDisabled = computed(
    () => !!(this.externalDisabled() !== undefined ? this.externalDisabled() : this._disabled()),
  );

  // Inject NgControl to access validation state
  protected ngControl = inject(NgControl, { optional: true, self: true });

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
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

  handleBlur(event: any): void {
    this.onModelTouched();
    this.onBlur.emit(event);
  }
}
