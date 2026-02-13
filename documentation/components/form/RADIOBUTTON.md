# RadioButton Component

A highly reusable and accessible radio button component built with **Angular v20+**, **Signals**, and **PrimeNG**. It implements the `ControlValueAccessor` interface, allowing it to work seamlessly with Angular's Reactive Forms.

## 📍 Location

`src/app/shared/components/radiobutton/`

## 🚀 Usage

The RadioButton component is designed to be used inside a `FormGroup`. It requires an array of `options` of type `OptionRadio`.

```typescript
options: OptionRadio[] = [
  { label: 'Male', value: 'M' },
  { label: 'Female', value: 'F' }
];
```

```html
<form [formGroup]="form">
  <lib-radiobutton label="Gender" [options]="options" formControlName="gender" name="genderGroup" />
</form>
```

## 🛠 Features

- **Standardized Options**: Uses `OptionRadio` interface for consistent data structure.
- **Reactive Forms Integration**: Supports `formControlName` and `formControl` via `ControlValueAccessor`.
- **Signals Powered**: Uses the latest Angular signal-based inputs.
- **Accessibility (A11y)**: Automatically handles label-to-input associations and ARIA attributes via PrimeNG.
- **Validation Support**: Automatically reflects valid/invalid states (e.g., `required`) from the parent `FormControl`.

## ⚙️ API

### Types

```typescript
export interface OptionRadio {
  value: string;
  label: string;
}
```

### Inputs

| Property   | Type                   | Default          | Description                                           |
| :--------- | :--------------------- | :--------------- | :---------------------------------------------------- |
| `label`    | `input<string>`        | `''`             | Text displayed above the radio button group.          |
| `options`  | `input<OptionRadio[]>` | `[]`             | Array of options to display.                          |
| `required` | `input<boolean>`       | `false`          | Whether the field is required (for visual indicator). |
| `id`       | `input<string>`        | _Auto-generated_ | Unique base identifier for labels and inputs.         |
| `name`     | `input<string>`        | _Auto-generated_ | The name attribute for the group of radio buttons.    |
| `hint`     | `input<string>`        | `''`             | Helper/Hint text displayed below the field.           |

### Outputs

| Event      | Type                 | Description                             |
| :--------- | :------------------- | :-------------------------------------- |
| `onChange` | `output<any>`        | Emitted when the selection changes.     |
| `onBlur`   | `output<FocusEvent>` | Emitted when the component loses focus. |

## 💡 Implementation Details

This component wraps the PrimeNG `p-radioButton` and follows the same pattern as `TextboxComponent` and `DropdownComponent`.

### Best Practices Followed:

- **`ChangeDetectionStrategy.OnPush`**: Ensures high performance.
- **Standalone Component**: No `NgModule` required.
- **Reactive Forms**: Implements `ControlValueAccessor`.
