import {
  Component,
  forwardRef,
  input,
  signal,
  inject,
  ChangeDetectionStrategy,
  output,
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

export interface OptionDropdown {
  value: string;
  label: string;
}

@Component({
  selector: 'lib-dropdown',
  standalone: true,
  imports: [CommonModule, SelectModule, ReactiveFormsModule, FormsModule],
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
  showClear = input<boolean>(false);
  loading = input<boolean>(false);

  onChange = output<any>();
  onBlur = output<FocusEvent>();

  value = signal<any>(null);
  disabled = signal<boolean>(false);

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
    this.value.set(value);
  }

  registerOnChange(fn: any): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onModelTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  handleValueChange(value: any): void {
    this.value.set(value);
    this.onModelChange(value);
    this.onChange.emit(value);
  }

  handleBlur(event: any): void {
    this.onModelTouched();
    this.onBlur.emit(event);
  }
}
