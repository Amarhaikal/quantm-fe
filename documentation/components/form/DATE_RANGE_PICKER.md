# DateRangePicker Component

A highly reusable and accessible date range picker component built with **Angular v20+**, **Signals**, and **PrimeNG**. It implements the `ControlValueAccessor` interface, allowing it to work seamlessly with Angular's Reactive Forms. The value it produces is a **tuple** of two dates: `[startDate, endDate]`.

## 📍 Location

`src/app/shared/components/form/date-range-picker/`

## 🚀 Usage

The DateRangePicker component is designed to be used inside a `FormGroup`. It automatically handles translations for labels and placeholders. The bound `FormControl` value will be a `[string, string | null]` tuple in `YYYY-MM-DD` format (or ISO strings when `showTime` is enabled).

```html
<form [formGroup]="form">
  <lib-date-range-picker
    label="label.date_range"
    formControlName="dateRange"
    placeholder="placeholder.select_date_range"
  />
</form>
```

### Accessing the value

```typescript
form = this.fb.group({
  dateRange: [null],
});

// After the user selects a range, the value will be:
// ['2024-01-01', '2024-01-31']  (with showTime: false)
// ['2024-01-01T00:00:00.000Z', '2024-01-31T23:59:59.999Z']  (with showTime: true)

get startDate() {
  return this.form.value.dateRange?.[0] ?? null;
}

get endDate() {
  return this.form.value.dateRange?.[1] ?? null;
}
```

## 🛠 Features

- **Range Selection**: Uses PrimeNG's built-in `selectionMode="range"` to let users pick a start and end date from a single calendar overlay.
- **Appearance Logic**: Consumes `AppearanceService` for global label positioning (`left` vs `top`).
- **Standardized Disabled State**: Correctly handles both manual `[disabled]` attributes and `FormControl` disabled states.
- **Optimized for Backend**: Automatically formats dates as `YYYY-MM-DD` or ISO strings for the backend.
- **Reactive Forms Integration**: Supports `formControlName` and `formControl` via `ControlValueAccessor`.
- **Signals Powered**: Uses the latest Angular signal-based inputs.
- **Accessibility (A11y)**: Automatically handles label-to-input associations and ARIA attributes.
- **Partial Selection Guard**: Emits a value only when both start and end dates are selected, avoiding incomplete state being written to the form.

## ⚙️ API

### Inputs

| Property        | Type              | Default          | Description                                               |
| :-------------- | :---------------- | :--------------- | :-------------------------------------------------------- |
| `label`         | `input<string>`   | `''`             | Key for translation (e.g., `label.date_range`).           |
| `placeholder`   | `input<string>`   | `''`             | Key for translation for the input field placeholder.      |
| `hint`          | `input<string>`   | `''`             | Helper/Hint text displayed below the field.               |
| `id`            | `input<string>`   | _Auto-generated_ | Unique identifier for the input element.                  |
| `required`      | `input<boolean>`  | `false`          | Whether the field is required.                            |
| `showTime`      | `input<boolean>`  | `false`          | Whether to show time selection alongside the date picker. |
| `hourFormat`    | `'12' \| '24'`    | `'24'`           | Format for time selection when `showTime` is `true`.      |
| `dateFormat`    | `input<string>`   | `'dd/mm/yy'`     | Display format (PrimeNG style).                           |
| `showIcon`      | `input<boolean>`  | `true`           | Whether to show the calendar icon button.                 |
| `labelPosition` | `'left' \| 'top'` | _Global Default_ | Override the default global label positioning.            |
| `disabled`      | `input<boolean>`  | `false`          | Manually toggle the disabled state.                       |

### Output / Form Value

The `FormControl` value bound to this component will always be one of:

| State                   | Value                               |
| :---------------------- | :---------------------------------- |
| Nothing selected        | `null`                              |
| Only start selected     | `null` _(partial; held internally)_ |
| Both dates selected     | `['YYYY-MM-DD', 'YYYY-MM-DD']`      |
| Both + `showTime: true` | `['ISO string', 'ISO string']`      |

## 💡 Implementation Details

This component wraps the PrimeNG `p-datepicker` in `selectionMode="range"` and implements `ControlValueAccessor`.

### Key Differences from `DatePickerComponent`

| Concern             | `DatePickerComponent`    | `DateRangePickerComponent`                       |
| :------------------ | :----------------------- | :----------------------------------------------- |
| Selection mode      | Single date              | `range` (start + end)                            |
| Internal value type | `signal<Date \| null>`   | `signal<Date[] \| null>`                         |
| Emitted form value  | `string \| null`         | `[string, string] \| null`                       |
| Partial selection   | N/A                      | Ignored — emits only when both dates are defined |
| `writeValue` input  | `string \| Date \| null` | `[string, string] \| null`                       |

### Best Practices Followed

- **`ChangeDetectionStrategy.OnPush`**: Ensures high performance.
- **Standalone Component**: No `NgModule` required.
- **Automatic Formatting**: Handles `Date[]` to `[string, string]` conversion for API compatibility.
- **No partial emission**: If the user selects only a start date (range not yet complete), the form control value is not updated until both dates are chosen.

### Internal Signal Shape

```typescript
// Holds the raw [Date, Date] selection from PrimeNG
value = signal<Date[] | null>(null);
```

### `writeValue` Behaviour

Accepts either:

- `null` / `undefined` — clears the selection.
- `[string, string]` — converts each ISO/date string to a `Date` object and sets the internal signal.

```typescript
writeValue(value: [string, string] | null): void {
  if (Array.isArray(value) && value.length === 2) {
    const start = new Date(value[0]);
    const end = new Date(value[1]);
    this.value.set([start, end]);
  } else {
    this.value.set(null);
  }
}
```

### `handleValueChange` Behaviour

Called by `(ngModelChange)` on the PrimeNG picker. Emits to the parent form only when both dates are defined.

```typescript
handleValueChange(dates: Date[] | null): void {
  this.value.set(dates);

  const [start, end] = dates ?? [];

  // Guard: do not emit if the range is incomplete
  if (!start || !end) return;

  const fmt = (d: Date) =>
    this.showTime()
      ? d.toISOString()
      : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  this.onModelChange([fmt(start), fmt(end)]);
}
```

## 🗂 File Structure

```
src/app/shared/components/form/date-range-picker/
├── date-range-picker.ts      # Component class
├── date-range-picker.html    # Template
└── date-range-picker.css     # Component-scoped styles
```
