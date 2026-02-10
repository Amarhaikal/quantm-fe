# Button Component

A highly reusable and accessible button component built with **Angular v20+**, **Signals**, and **Tailwind CSS**. It supports various styles, sizes, and predefined behavioral types.

## 📍 Location

`src/app/shared/components/button/`

## 🚀 Usage

The Button component can be used with a predefined `type` for standard actions or fully customized with individual inputs.

### Basic Usage with Types

Using the `type` input automatically configures the label, icon, and variant.

```html
<!-- Renders a secondary button with "Cancel" label and times icon -->
<lib-button type="CANCEL" (click)="onCancel()" />

<!-- Renders a primary button with "Save" label and check icon -->
<lib-button type="SAVE" (click)="onSave()" />
```

### fully Custom Usage

You can override any property or forgo the `type` entirely.

```html
<lib-button label="Custom Action" icon="pi pi-rocket" variant="outline" (click)="onCustom()" />
```

### Loading State

```html
<lib-button type="SAVE" [loading]="isSaving" />
```

## 🛠 Features

- **Predefined Types**: `CANCEL`, `SAVE`, `UPDATE`, `SAVE_CHANGES` for consistent UI.
- **Variants**: `primary`, `secondary`, `outline`, `danger`, `ghost`, `link`.
- **Sizes**: `sm`, `md`, `lg`.
- **Loading State**: Automatically shows a spinner and disables the button.
- **Accessibility**: Native `button` element with proper attributes.

## ⚙️ API

### Types

```typescript
export type ButtonType = 'CANCEL' | 'SAVE' | 'UPDATE' | 'SAVE_CHANGES';
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonHtmlType = 'button' | 'submit' | 'reset';
```

### Inputs

| Property   | Type                       | Default     | Description                                                      |
| :--------- | :------------------------- | :---------- | :--------------------------------------------------------------- |
| `type`     | `input<ButtonType>`        | `undefined` | Predefined semantic type. Sets default label, icon, and variant. |
| `htmlType` | `input<ButtonHtmlType>`    | `'button'`  | Native HTML button type.                                         |
| `label`    | `input<string>`            | `''`        | Button text. Overrides `type` default.                           |
| `variant`  | `input<ButtonVariant>`     | `'primary'` | Visual style. Overrides `type` default.                          |
| `size`     | `input<ButtonSize>`        | `'md'`      | Button size.                                                     |
| `icon`     | `input<string>`            | `''`        | Icon class (PrimeIcons). Overrides `type` default.               |
| `iconPos`  | `input<'left' \| 'right'>` | `'left'`    | Icon position relative to text.                                  |
| `loading`  | `input<boolean>`           | `false`     | Shows loading spinner and disables button.                       |
| `disabled` | `input<boolean>`           | `false`     | Disables the button.                                             |
| `block`    | `input<boolean>`           | `false`     | Makes the button full width.                                     |

### Outputs

| Event   | Type                 | Description         |
| :------ | :------------------- | :------------------ |
| `click` | `output<MouseEvent>` | Native click event. |

## 💡 Implementation Details

- **Signals**: Uses `computed` signals to resolve the final label, icon, and variant based on the `type` and manual overrides.
- **Tailwind**: Styles are applied using utility classes.
- **ChangeDetection**: `OnPush` for performance.
