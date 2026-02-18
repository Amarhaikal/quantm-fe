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
import { RadioButtonModule } from 'primeng/radiobutton';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@ngneat/transloco';
import { Subscription } from 'rxjs';
import { AppearanceService, LabelPosition } from '../../../../core/services/appearance.service';

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
export class RadioButtonComponent implements ControlValueAccessor, OnInit, OnDestroy {
  private appearanceService = inject(AppearanceService);
  private cdr = inject(ChangeDetectorRef);

  label = input<string>('');
  required = input<boolean>(false);
  options = input<OptionRadio[]>([]);
  id = input<string>(`rb-${Math.random().toString(36).substring(2, 11)}`);
  name = input<string>(`group-${Math.random().toString(36).substring(2, 11)}`);
  hint = input<string>('');
  labelPosition = input<LabelPosition | undefined>(undefined);

  /**
   * Effective label position based on explicit property or global appearance setting.
   */
  effectiveLabelPosition = computed(
    () => this.labelPosition() ?? this.appearanceService.labelPosition(),
  );

  isDisabled = input<boolean | undefined>(undefined, { alias: 'disabled' });

  onChange = output<any>();
  onBlur = output<FocusEvent>();

  value = signal<any>(null);
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
    this.value.set(value);
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
    this.value.set(value);
    this.onModelChange(value);
    this.onChange.emit(value);
  }

  handleBlur(event: any): void {
    this.onModelTouched();
    this.onBlur.emit(event);
  }
}
