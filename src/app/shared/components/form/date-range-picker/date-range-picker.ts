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
  selector: 'lib-date-range',
  imports: [CommonModule, DatePickerModule, ReactiveFormsModule, FormsModule, TranslocoPipe],
  templateUrl: './date-range-picker.html',
  styleUrl: './date-range-picker.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateRangePickerComponent implements ControlValueAccessor, OnInit, OnDestroy {
  private appearanceService = inject(AppearanceService);
  private cdr = inject(ChangeDetectorRef);

  label = input<string>('');
  required = input<boolean>(false);
  placeholder = input<string>('');
  hint = input<string>('');
  id = input<string>(`drp-${Math.random().toString(36).substring(2, 11)}`);
  showTime = input<boolean>(false);
  hourFormat = input<'12' | '24'>('24');
  dateFormat = input<string>('dd/mm/yy');
  showIcon = input<boolean>(true);
  labelPosition = input<LabelPosition | undefined>(undefined);
  isSearching = input<boolean>(false);

  /** Effective label position based on explicit property or global appearance setting. */
  effectiveLabelPosition = computed(() => {
    if (this.isSearching()) return 'top';
    return this.labelPosition() ?? this.appearanceService.labelPosition();
  });

  isDisabled = input<boolean | undefined>(undefined, { alias: 'disabled' });

  /** Internal range value: PrimeNG returns a `Date[]` in range mode. */
  value = signal<Date[] | null>(null);
  private _disabled = signal<boolean>(false);

  /** Effective disabled state based on explicit property or form control state. */
  effectiveDisabled = computed(
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
    return !!(control.invalid && (control.dirty || control.touched));
  });

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
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

  ngOnDestroy(): void {
    this.statusSub?.unsubscribe();
  }

  // ── ControlValueAccessor ────────────────────────────────────────────────────
  private onModelChange: (value: [string, string] | null) => void = () => {};
  private onModelTouched: () => void = () => {};

  /**
   * Accepts `[string, string] | null` from the parent form.
   * Converts each string to a `Date` object for PrimeNG.
   */
  writeValue(value: [string, string] | null): void {
    if (Array.isArray(value) && value.length === 2 && value[0] && value[1]) {
      const start = new Date(value[0]);
      const end = new Date(value[1]);
      const isValid = !isNaN(start.getTime()) && !isNaN(end.getTime());
      this.value.set(isValid ? [start, end] : null);
    } else {
      this.value.set(null);
    }
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: [string, string] | null) => void): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onModelTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled.set(isDisabled);
  }

  // ── Event Handlers ──────────────────────────────────────────────────────────
  handleValueChange(dates: Date[] | null): void {
    this.value.set(dates);

    const start = dates?.[0];
    const end = dates?.[1];

    // Do not emit if the range is incomplete (user picked only start so far)
    if (!start || !end) {
      return;
    }

    const fmt = (d: Date): string => {
      if (this.showTime()) {
        return d.toISOString();
      }
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    this.onModelChange([fmt(start), fmt(end)]);
  }

  handleBlur(): void {
    this.onModelTouched();
  }

  /** Clear the selection and notify the parent form. */
  clearRange(): void {
    this.value.set(null);
    this.onModelChange(null);
    this.onModelTouched();
  }
}
