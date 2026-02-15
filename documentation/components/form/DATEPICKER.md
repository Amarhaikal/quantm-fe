# DatePicker Component

A highly reusable and accessible date picker component built with **Angular v20+**, **Signals**, and **PrimeNG**. It implements the `ControlValueAccessor` interface, allowing it to work seamlessly with Angular's Reactive Forms.

## 📍 Location

`src/app/shared/components/datepicker/`

## 🚀 Usage

The DatePicker component is designed to be used inside a `FormGroup`. It automatically handles translations for labels and placeholders.

```html
<form [formGroup]="form">
  <lib-datepicker
    label="label.birth_date"
    formControlName="birthDate"
    placeholder="placeholder.select_date"
  />
</form>
```

## 🛠 Features

- **Appearance Logic**: Consumes `AppearanceService` for global label positioning (`left` vs `top`).
- **Standardized Disabled State**: Correctly handles both manual `[disabled]` attributes and `FormControl` disabled states.
- **Optimized for Backend**: Automatically formats dates as `YYYY-MM-DD` or ISO strings for the backend.
- **Reactive Forms Integration**: Supports `formControlName` and `formControl` via `ControlValueAccessor`.
- **Signals Powered**: Uses the latest Angular signal-based inputs.
- **Accessibility (A11y)**: Automatically handles label-to-input associations and ARIA attributes.

## ⚙️ API

### Inputs

| Property        | Type              | Default          | Description                                     |
| :-------------- | :---------------- | :--------------- | :---------------------------------------------- |
| `label`         | `input<string>`   | `''`             | Key for translation (e.g., `label.birth_date`). |
| `placeholder`   | `input<string>`   | `''`             | Key for translation.                            |
| `hint`          | `input<string>`   | `''`             | Helper/Hint text displayed below the field.     |
| `id`            | `input<string>`   | _Auto-generated_ | Unique identifier.                              |
| `required`      | `input<boolean>`  | `false`          | Whether the field is required.                  |
| `showTime`      | `input<boolean>`  | `false`          | Whether to show time selection.                 |
| `hourFormat`    | `'12' \| '24'`    | `'24'`           | Format for time selection.                      |
| `dateFormat`    | `input<string>`   | `'dd/mm/yy'`     | Display format (PrimeNG style).                 |
| `showIcon`      | `input<boolean>`  | `true`           | Whether to show the calendar icon.              |
| `labelPosition` | `'left' \| 'top'` | _Global Default_ | Override the default label positioning.         |
| `disabled`      | `input<boolean>`  | `false`          | Manually toggle the disabled state.             |

## 💡 Implementation Details

This component wraps the PrimeNG `p-datepicker` and implements `ControlValueAccessor`.

### Best Practices Followed:

- **`ChangeDetectionStrategy.OnPush`**: Ensures high performance.
- **Standalone Component**: No `NgModule` required.
- **Automatic Formatting**: Handles `Date` to `string` conversion for API compatibility.
