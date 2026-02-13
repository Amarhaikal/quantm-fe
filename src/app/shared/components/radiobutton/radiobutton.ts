import { Component, input, signal, inject, ChangeDetectionStrategy, output } from '@angular/core';
import { ControlValueAccessor, NgControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@ngneat/transloco';

export interface OptionRadio {
  value: string;
  label: string;
}

@Component({
  selector: 'lib-radiobutton',
  standalone: true,
  imports: [CommonModule, RadioButtonModule, ReactiveFormsModule, FormsModule, TranslocoPipe],
  templateUrl: './radiobutton.html',
  styleUrl: './radiobutton.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioButtonComponent implements ControlValueAccessor {
  label = input<string>('');
  required = input<boolean>(false);
  options = input<OptionRadio[]>([]);
  id = input<string>(`rb-${Math.random().toString(36).substring(2, 11)}`);
  name = input<string>(`group-${Math.random().toString(36).substring(2, 11)}`);
  hint = input<string>('');

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
