# Dropdown Component

A highly reusable and accessible dropdown component built with **Angular v20+**, **Signals**, and **PrimeNG**. It implements the `ControlValueAccessor` interface, allowing it to work seamlessly with Angular's Reactive Forms.

## 📍 Location

`src/app/shared/components/dropdown/`

## 🚀 Usage

The Dropdown component is designed to be used inside a `FormGroup`. By default, it uses `label` and `value` properties from the options.

```typescript
options: OptionDropdown[] = [
  { label: 'New York', value: 'NY' },
  { label: 'Rome', value: 'RM' },
  { label: 'London', value: 'LDN' }
];
```

```html
<form [formGroup]="form">
  <lib-dropdown
    label="Select City"
    [options]="options"
    formControlName="city"
    placeholder="Select a city"
    hint="Choose your favorite city."
  />
</form>
```

## 🛠 Features

- **Standardized Options**: Uses `OptionDropdown` interface for consistent data structure.
- **Reactive Forms Integration**: Supports `formControlName` and `formControl` via `ControlValueAccessor`.
- **Signals Powered**: Uses the latest Angular signal-based inputs.
- **Accessibility (A11y)**: Automatically handles label-to-input associations and ARIA attributes via PrimeNG.
- **Validation Support**: Automatically reflects valid/invalid states from the parent `FormControl`.

## ⚙️ API

### Types

```typescript
export interface OptionDropdown {
  value: string;
  label: string;
}
```

### Inputs

| Property      | Type                      | Default          | Description                                           |
| :------------ | :------------------------ | :--------------- | :---------------------------------------------------- |
| `label`       | `input<string>`           | `''`             | Text displayed above the dropdown.                    |
| `options`     | `input<OptionDropdown[]>` | `[]`             | Array of options to display.                          |
| `placeholder` | `input<string>`           | `''`             | Help text displayed when no selection is made.        |
| `hint`        | `input<string>`           | `''`             | Helper/Hint text displayed below the field.           |
| `id`          | `input<string>`           | _Auto-generated_ | Unique identifier for the dropdown and label.         |
| `filter`      | `input<boolean>`          | `false`          | Whether to display a filter input.                    |
| `showClear`   | `input<boolean>`          | `false`          | Whether a clear icon is displayed to clear the value. |

### Outputs

| Event      | Type                 | Description                             |
| :--------- | :------------------- | :-------------------------------------- |
| `onChange` | `output<any>`        | Emitted when the selection changes.     |
| `onBlur`   | `output<FocusEvent>` | Emitted when the component loses focus. |

## 💡 Implementation Details

This component wraps the PrimeNG `p-dropdown` and follows the same pattern as `TextboxComponent`.

### Best Practices Followed:

- **`ChangeDetectionStrategy.OnPush`**: Ensures high performance.
- **Standalone Component**: No `NgModule` required.
- **Reactive Forms**: Implements `ControlValueAccessor`.
