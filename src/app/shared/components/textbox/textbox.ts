import {
  Component,
  forwardRef,
  input,
  signal,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { CommonModule } from '@angular/common';

export type TextboxType = 'text' | 'email' | 'IDNO';

@Component({
  selector: 'lib-textbox',
  standalone: true,
  imports: [CommonModule, InputTextModule, InputMaskModule, ReactiveFormsModule, FormsModule],
  templateUrl: './textbox.html',
  styleUrl: './textbox.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextboxComponent implements ControlValueAccessor {
  label = input<string>('');
  required = input<boolean>(false);
  placeholder = input<string>('');
  hint = input<string>('');
  type = input<TextboxType>('text');
  id = input<string>(`txt-${Math.random().toString(36).substring(2, 11)}`);
  icon = input<string>('');

  value = signal<string>('');
  disabled = signal<boolean>(false);

  // Inject NgControl to access validation state
  protected ngControl = inject(NgControl, { optional: true, self: true });

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  // ControlValueAccessor methods
  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: any): void {
    this.value.set(value || '');
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  handleInput(event: any): void {
    const val = event.target ? event.target.value : event.value ? event.value : event;
    this.value.set(val);
    this.onChange(val);
  }

  handleBlur(): void {
    this.onTouched();
  }
}
