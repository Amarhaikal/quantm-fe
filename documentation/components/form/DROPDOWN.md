# Dropdown Component

A highly reusable and accessible dropdown component built with **Angular v20+**, **Signals**, and **PrimeNG**. It implements the `ControlValueAccessor` interface, allowing it to work seamlessly with Angular's Reactive Forms.

## 📍 Location

`src/app/shared/components/dropdown/`

## 🚀 Usage

The Dropdown component is designed to be used inside a `FormGroup`. It automatically handles translations for labels and placeholders.

### Global Appearance

By default, the component follows the global settings in `AppearanceService`. You can override the label position per-component if needed.

```html
<form [formGroup]="form">
  <lib-dropdown
    label="label.city"
    [options]="options"
    formControlName="city"
    placeholder="placeholder.select_city"
  />
</form>
```

## 🛠 Features

- **Appearance Logic**: Consumes `AppearanceService` for global label positioning (`left` vs `top`).
- **Standardized Disabled State**: Correctly handles both manual `[disabled]` attributes and `FormControl` disabled states.
- **Improved Contrast**: Disabled values use `text-gray-500!` on a `gray-100` background.
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

| Property        | Type                      | Default          | Description                                            |
| :-------------- | :------------------------ | :--------------- | :----------------------------------------------------- |
| `label`         | `input<string>`           | `''`             | Key for translation (e.g., `label.city`).              |
| `options`       | `input<OptionDropdown[]>` | `[]`             | Array of options to display.                           |
| `placeholder`   | `input<string>`           | `''`             | Key for translation.                                   |
| `hint`          | `input<string>`           | `''`             | Helper/Hint text displayed below the field.            |
| `id`            | `input<string>`           | _Auto-generated_ | Unique identifier for the dropdown and label.          |
| `filter`        | `input<boolean>`          | `false`          | Whether to display a filter input.                     |
| `showClear`     | `input<boolean>`          | `false`          | Whether a clear icon is displayed.                     |
| `labelPosition` | `'left' \| 'top'`         | _Global Default_ | Override the default label positioning.                |
| `disabled`      | `input<boolean>`          | `false`          | Manually toggle the disabled state.                    |
| `required`      | `input<boolean>`          | `false`          | Marks the field as required for validation.            |
| `isTable`       | `input<boolean>`          | `false`          | Enables compact table mode (reduced height & padding). |

### Outputs

| Event      | Type                 | Description                             |
| :--------- | :------------------- | :-------------------------------------- |
| `onChange` | `output<any>`        | Emitted when the selection changes.     |
| `onBlur`   | `output<FocusEvent>` | Emitted when the component loses focus. |

## 💡 Implementation Details

This component wraps the PrimeNG `p-select` and follows the same pattern as `TextboxComponent`.

### Table Mode (`isTable`)

When `isTable` is set to `true`, the dropdown applies compact styling optimized for inline table editing:

- **Height**: Reduced to `h-8` (from `h-9`).
- **Padding**: `px-0` on the outer `p-select`, and `8px` padding on the inner `.p-select-label` (from `14px`).
- **Host Class**: Adds `table-mode` class to the host element for CSS scoping.

### Smart Validation in Table Mode

The `showError` logic is designed to avoid false-positive error messages when editing existing data:

- **Empty fields**: Errors are shown immediately (e.g., on newly added rows).
- **Pre-filled fields**: Errors are only shown after user interaction (`dirty` or `touched`). This prevents "This field is required" from flashing when a row with existing data enters edit mode.

> The `controlState` signal is explicitly updated after the `statusChanges` subscription is established in `ngOnInit`, ensuring `showError` re-evaluates with the correct control state after the initial value is written.

### Best Practices Followed:

- **`ChangeDetectionStrategy.OnPush`**: Ensures high performance.
- **Standalone Component**: No `NgModule` required.
- **Reactive Forms**: Implements `ControlValueAccessor`.
