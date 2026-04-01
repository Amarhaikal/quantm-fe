# Tab Component

A lightweight, reusable tab wrapper built with **Angular v20+**, **Signals**, and **PrimeNG Tabs**. It provides a consistent, configuration-driven tab interface with icon support and two-way active-tab binding.

## 📍 Location

`src/app/layout/components/tab/`

## 🚀 Usage

The Tab component accepts a `tabs` array and projects `<p-tabpanel>` elements from the parent via `ng-content`.

```html
<app-tab [tabs]="tabs">
  <p-tabpanel value="general">
    <app-user-general ... />
  </p-tabpanel>

  <p-tabpanel value="directors">
    <app-user-directors ... />
  </p-tabpanel>

  <p-tabpanel value="shareholders">
    <app-user-shareholders ... />
  </p-tabpanel>
</app-tab>
```

```typescript
import { TabItem } from '../../../../layout/components/tab/tab';
import { TabPanel } from 'primeng/tabs';

tabs: TabItem[] = [
  { label: 'General', value: 'general', icon: 'pi pi-user' },
  { label: 'Directors', value: 'directors', icon: 'pi pi-users' },
  { label: 'Shareholders', value: 'shareholders', icon: 'pi pi-chart-pie' },
];
```

## 🛠 Features

- **Configuration-driven**: Define tabs via a simple `TabItem[]` array — no need to manage PrimeNG tab markup directly.
- **Icon support**: Each tab can display a PrimeNG icon (e.g., `pi pi-user`) alongside the label.
- **Two-way active tab binding**: The `value` model signal can be read and controlled by the parent.
- **Content projection**: Panel content is projected via `ng-content`, keeping each tab's content in the parent's control.
- **OnPush**: Uses `ChangeDetectionStrategy.OnPush` for efficient rendering.

## ⚙️ API

### Inputs

| Property | Type                     | Default | Description                                  |
| :------- | :----------------------- | :------ | :------------------------------------------- |
| `tabs`   | `TabItem[]` *(required)* | —       | Array of tab definitions (label, value, icon). |

### Model (Two-way bindable)

| Property | Type              | Default | Description                           |
| :------- | :---------------- | :------ | :------------------------------------ |
| `value`  | `string \| number` | `0`    | The value of the currently active tab. |

### TabItem Interface

```typescript
export interface TabItem {
  label: string;          // Display text for the tab header
  value: string | number; // Unique identifier — must match the p-tabpanel value
  icon?: string;          // Optional PrimeNG icon class (e.g., 'pi pi-user')
}
```

## 💡 Implementation Details

### Content Projection

`app-tab` renders a `<p-tabpanels>` wrapper with `<ng-content>` inside. The parent is responsible for placing `<p-tabpanel [value]="...">` elements as children. The `value` on each `p-tabpanel` **must match** the corresponding `value` in the `tabs` input array.

```html
<!-- ✅ Correct — values match -->
<app-tab [tabs]="[{ label: 'Info', value: 'info' }]">
  <p-tabpanel value="info">...</p-tabpanel>
</app-tab>
```

### Required Parent Imports

To use `<p-tabpanel>` in the parent template, import `TabPanel` from `primeng/tabs`:

```typescript
import { TabPanel } from 'primeng/tabs';
import { TabComponent, TabItem } from '../../../../layout/components/tab/tab';

@Component({
  imports: [TabComponent, TabPanel],
  ...
})
```

### Controlling the Active Tab

Use the `[(value)]` two-way binding syntax or `[value]` + `(valueChange)` to programmatically switch tabs:

```html
<!-- Two-way binding -->
<app-tab [tabs]="tabs" [(value)]="activeTab">
  ...
</app-tab>
```

```typescript
activeTab = signal<string | number>('general');

switchToDirectors() {
  this.activeTab.set('directors');
}
```

### Best Practices

- **Match `value`**: Ensure every `TabItem.value` has a corresponding `<p-tabpanel [value]="...">` or the tab panel will be empty.
- **Lazy content**: Tab panel content is rendered lazily by PrimeNG — components inside inactive tabs are not mounted until first activated.
- **Self-contained panels**: Each panel component should manage its own data fetching and state independently, receiving only what it needs (e.g., `userId`) as inputs.
