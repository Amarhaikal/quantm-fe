# Unsaved Changes Protection

A reusable mechanism to prevent users from accidentally losing unsaved form data. It handles both **internal Angular routing** (menu clicks) and **external browser events** (reload/close tab).

## 📍 Location

- **Base Class**: `src/app/core/base/base-form.component.ts`
- **Interface**: `src/app/core/interfaces/unsaved-changes.interface.ts`
- **Guard**: `src/app/core/guards/pending-changes.guard.ts`
- **Service**: `src/app/core/services/confirm.service.ts`

## 🚀 Usage

To avoid repeating the same logic across 50+ forms, use the **inheritance** pattern below.

### 1. Extend the BaseFormComponent

Your component should extend `BaseFormComponent`. This automatically handles the `@HostListener` for you. You only need to implement the `hasUnsavedChanges()` method.

```typescript
import { Component } from '@angular/core';
import { BaseFormComponent } from '../../../core/base/base-form.component';

@Component({ ... })
export class MyFormComponent extends BaseFormComponent implements OnInit {
  form: FormGroup;

  constructor() {
    super(); // Required when extending a class
    // ... form initialization
  }

  // Used by the Guard and Base class
  hasUnsavedChanges(): boolean {
    return this.form.dirty;
  }

  // After a successful save, remember to mark the form as pristine!
  onSave() {
    this.service.update(data).subscribe(() => {
      this.form.markAsPristine();
    });
  }
}
```

### 2. Apply the Guard to your Route

In your routing configuration, add `pendingChangesGuard` to the `canDeactivate` array.

```typescript
import { Routes } from '@angular/router';
import { pendingChangesGuard } from '../../core/guards/pending-changes.guard';

export const MY_ROUTES: Routes = [
  {
    path: 'my-form',
    loadComponent: () => import('./my-form/my-form').then((m) => m.MyFormComponent),
    canDeactivate: [pendingChangesGuard],
  },
];
```

## 🛠 Features

- **Scalable**: Zero code duplication for the reload/close protection.
- **Signals Integration**: Compatible with Angular v20+ signal-based components.
- **Transloco Supported**: All messages shown in the confirmation dialog are fully translatable.
- **PrimeNG Components**: Uses `ConfirmationService` for a consistent look and feel.

## 🌐 Translations

The guard uses translation keys under the `confirm` block in `en.json` and `my.json`.

## 💡 Implementation Details

The `BaseFormComponent` is an `@Directive()` that handles the `window:beforeunload` event globally for any form that extends it. The `pendingChangesGuard` handles internal Angular navigation by intercepting route changes.
