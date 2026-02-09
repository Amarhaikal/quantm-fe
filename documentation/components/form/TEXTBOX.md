# Textbox Component

A highly reusable and accessible textbox component built with **Angular v20+**, **Signals**, and **PrimeNG**. It implements the `ControlValueAccessor` interface, allowing it to work seamlessly with Angular's Reactive Forms.

## 📍 Location

`src/app/shared/components/textbox/`

## 🚀 Usage

The Textbox component is designed to be used inside a `FormGroup`. You do not need manual value bindings; simply use `formControlName`. Labels are **top-aligned** by default for better scanning and mobile support.

```html
<form [formGroup]="form">
  <lib-textbox
    label="Username"
    formControlName="username"
    placeholder="Enter your username"
    hint="Enter your username to reset your password."
    icon="pi pi-user"
  />
</form>
```

## 🛠 Features

- **Reactive Forms Integration**: Supports `formControlName` and `formControl` via `ControlValueAccessor`.
- **Signals Powered**: Uses the latest Angular signal-based inputs and outputs.
- **Accessibility (A11y)**: Automatically handles label-to-input associations and ARIA attributes.
- **Validation Support**: Automatically reflects valid/invalid states from the parent `FormControl`.

## ⚙️ API

### Inputs

| Property      | Type                | Default          | Description                                            |
| :------------ | :------------------ | :--------------- | :----------------------------------------------------- |
| `label`       | `input<string>`     | `''`             | Text displayed above the input field.                  |
| `placeholder` | `input<string>`     | `''`             | Help text displayed inside the field when empty.       |
| `hint`        | `input<string>`     | `''`             | Helper/Hint text displayed below the field.            |
| `type`        | `'text' \| 'email'` | `'text'`         | HTML input type (restricted to supported types).       |
| `id`          | `input<string>`     | _Auto-generated_ | Unique identifier for the input and label association. |
| `icon`        | `input<string>`     | `''`             | PrimeNG icon class (e.g., `pi pi-search`).             |

### Outputs

| Event    | Type                 | Description                               |
| :------- | :------------------- | :---------------------------------------- |
| `onBlur` | `output<FocusEvent>` | Emitted when the input field loses focus. |

## 💡 Implementation Details

This component avoids manual `controlName` input by using the standard `NG_VALUE_ACCESSOR` provider. This ensures a clean API for the consumer.

### Best Practices Followed:

- **`ChangeDetectionStrategy.OnPush`**: Ensures high performance.
- **Standalone Component**: No `NgModule` required.
- **Strict Typing**: All inputs and internal states are strongly typed.
