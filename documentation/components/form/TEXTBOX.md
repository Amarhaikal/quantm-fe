# Textbox Component

A highly reusable and accessible textbox component built with **Angular v20+**, **Signals**, and **PrimeNG**. It implements the `ControlValueAccessor` interface, allowing it to work seamlessly with Angular's Reactive Forms.

## 📍 Location

`src/app/shared/components/textbox/`

## 🚀 Usage

The Textbox component is designed to be used inside a `FormGroup`. It automatically handles translations for labels and placeholders.

### Global Appearance

By default, the component follows the global settings in `AppearanceService`. You can override the label position per-component if needed.

```html
<form [formGroup]="form">
  <!-- Default (Standardized via AppearanceService) -->
  <lib-textbox
    label="label.username"
    formControlName="username"
    placeholder="placeholder.enter_username"
  />

  <!-- Explicit Override -->
  <lib-textbox label="label.email" formControlName="email" labelPosition="top" />
</form>
```

## 🛠 Features

- **Appearance Logic**: Consumes `AppearanceService` for global label positioning (`left` vs `top`).
- **Standardized Disabled State**: Correctly handles both manual `[disabled]` attributes and `FormControl` disabled states.
- **Darker Value Contrast**: Disabled text is set to `gray-500` on a `gray-100` background for better readability.
- **Typography**: Optimized to a consistent 14px (`text-sm`) for both labels and input values.
- **Reactive Forms Integration**: Supports `formControlName` and `formControl` via `ControlValueAccessor`.
- **Signals Powered**: Uses the latest Angular signal-based inputs and outputs.
- **Accessibility (A11y)**: Automatically handles label-to-input associations and ARIA attributes.
- **Validation Support**: Automatically reflects valid/invalid states from the parent `FormControl`.

## ⚙️ API

### Inputs

| Property        | Type                    | Default          | Description                                            |
| :-------------- | :---------------------- | :--------------- | :----------------------------------------------------- |
| `label`         | `input<string>`         | `''`             | Key for translation (e.g., `label.username`).          |
| `placeholder`   | `input<string>`         | `''`             | Key for translation.                                   |
| `hint`          | `input<string>`         | `''`             | Helper/Hint text displayed below the field.            |
| `type`          | `'text' \| 'email'` etc | `'text'`         | HTML input type. Supports `IDNO` and `PHONENO` masks.  |
| `id`            | `input<string>`         | _Auto-generated_ | Unique identifier for the input and label association. |
| `icon`          | `input<string>`         | `''`             | PrimeNG icon class (e.g., `pi pi-search`).             |
| `labelPosition` | `'left' \| 'top'`       | _Global Default_ | Override the default label positioning.                |
| `disabled`      | `input<boolean>`        | `false`          | Manually toggle the disabled state.                    |
| `required`      | `input<boolean>`        | `false`          | Marks the field as required for validation.            |
| `isTable`       | `input<boolean>`        | `false`          | Enables compact table mode (reduced height & padding). |

### Outputs

| Event    | Type                 | Description                               |
| :------- | :------------------- | :---------------------------------------- |
| `onBlur` | `output<FocusEvent>` | Emitted when the input field loses focus. |

## 💡 Implementation Details

This component avoids manual `controlName` input by using the standard `NG_VALUE_ACCESSOR` provider. This ensures a clean API for the consumer.

### Table Mode (`isTable`)

When `isTable` is set to `true`, the textbox applies compact styling optimized for inline table editing:

- **Height**: Reduced to `h-8` (from `h-9`).
- **Padding**: `px-2` and `pr-2` (from `px-3` and `pr-10`), removing the extra right padding used for icons in normal mode.

### Smart Validation in Table Mode

The `showError` logic is designed to avoid false-positive error messages when editing existing data:

- **Empty fields**: Errors are shown immediately (e.g., on newly added rows).
- **Pre-filled fields**: Errors are only shown after user interaction (`dirty` or `touched`). This prevents "This field is required" from flashing when a row with existing data enters edit mode.

> The `controlState` signal is explicitly updated after the `statusChanges` subscription is established in `ngOnInit`, ensuring `showError` re-evaluates with the correct control state after the initial value is written.

### Best Practices Followed:

- **`ChangeDetectionStrategy.OnPush`**: Ensures high performance.
- **Standalone Component**: No `NgModule` required.
- **Strict Typing**: All inputs and internal states are strongly typed.
