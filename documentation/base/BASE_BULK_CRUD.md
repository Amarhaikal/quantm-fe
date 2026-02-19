# BaseBulkCrudDirective

A reusable Angular directive that provides all the boilerplate for screens with **inline table editing** and **bulk create/update/delete** operations.

## 📍 Location

`src/app/core/base/base-bulk-crud.directive.ts`

## 🚀 Overview

`BaseBulkCrudDirective` extends `BaseListDirective` and adds:

- **State tracking**: `draftRows`, `modifiedRows`, `deletedRows` signals
- **Computed flag**: `hasPendingChanges` — `true` when any changes are pending
- **Event handlers**: `onRowsCreate`, `onRowsUpdate`, `onRowsDelete`, `onEdit`, `onCancel`
- **Bulk save**: `saveAllPending()` — sends create/update/delete requests in parallel via `forkJoin`
- **Validation**: Auto-validates that all `editableFields` are non-empty before saving
- **Helper**: `addNewRow()` — prepends a new editable row to a data signal

## 🛠 Usage

### Step 1: Extend the Directive

```typescript
export class MyComponent extends BaseBulkCrudDirective implements OnInit {
  private myService = inject(MyService);

  // 1. Define the data signal
  items = signal<MyItem[]>([]);

  // 2. Define which fields to extract for API payloads
  editableFields = ['name', 'code', 'description'];

  // 3. Provide the bulk API methods
  override bulkCrudApi: BulkCrudApi = {
    bulkCreate: (payload) => this.myService.createMany(payload),
    bulkUpdate: (payload) => this.myService.updateMany(payload),
    bulkDelete: (ids) => this.myService.deleteMany(ids),
  };

  // 4. Implement fetchData (required by BaseListDirective)
  fetchData(params?: any) {
    this.loading.set(true);
    this.myService.getList(params).subscribe({
      next: (response) => {
        this.items.set(response.data.data);
        this.totalRecords.set(response.data.total_count);
        this.loading.set(false);
      },
      error: (error) => this.handleError(error),
    });
  }

  // 5. Add row helper
  addItem() {
    this.addNewRow(this.items, { name: '', code: '', description: '' });
  }

  // 6. Override onCancel to pass your data signal
  override onCancel(rowData: any) {
    super.onCancel(rowData, this.items);
  }
}
```

### Step 2: Wire Up the Template

```html
<div class="flex justify-end gap-2">
  @if (hasPendingChanges()) {
  <lib-button type="SAVE" (click)="saveAllPending()" />
  }
  <lib-button type="ADD" (click)="addItem()" />
</div>

<lib-table
  [columns]="columns()"
  [data]="items()"
  [loading]="loading()"
  [totalRecords]="totalRecords()"
  [rows]="pageSize()"
  actionType="EDIT_DELETE"
  (onPageChange)="handlePageChange($event)"
  (onCancel)="onCancel($event)"
  (onEdit)="onEdit($event)"
  (onRowsCreate)="onRowsCreate($event)"
  (onRowsUpdate)="onRowsUpdate($event)"
  (onRowsDelete)="onRowsDelete($event)"
/>
```

## ⚙️ API

### Abstract Properties (must be implemented)

| Property         | Type          | Description                                                       |
| :--------------- | :------------ | :---------------------------------------------------------------- |
| `bulkCrudApi`    | `BulkCrudApi` | Object with `bulkCreate`, `bulkUpdate`, `bulkDelete` API methods. |
| `editableFields` | `string[]`    | List of field names to extract for create/update payloads.        |

### Inherited from BaseListDirective

| Property       | Type              | Description                         |
| :------------- | :---------------- | :---------------------------------- |
| `loading`      | `signal<boolean>` | Loading state.                      |
| `totalRecords` | `signal<number>`  | Total records count for pagination. |
| `pageNo`       | `signal<number>`  | Current page number.                |
| `pageSize`     | `signal<number>`  | Rows per page.                      |
| `fetchData()`  | `abstract method` | Must be implemented to fetch data.  |

### Signals (provided by BaseBulkCrudDirective)

| Property            | Type                | Description                                       |
| :------------------ | :------------------ | :------------------------------------------------ |
| `draftRows`         | `signal<any[]>`     | New rows confirmed as drafts (not yet saved).     |
| `modifiedRows`      | `signal<any[]>`     | Existing rows that have been edited.              |
| `deletedRows`       | `signal<any[]>`     | Existing rows marked for deletion.                |
| `hasPendingChanges` | `computed<boolean>` | `true` if any of the above signals are non-empty. |

### Methods (provided by BaseBulkCrudDirective)

| Method             | Description                                                                     |
| :----------------- | :------------------------------------------------------------------------------ |
| `onRowsCreate()`   | Handler for `lib-table` `(onRowsCreate)` event.                                 |
| `onRowsUpdate()`   | Handler for `lib-table` `(onRowsUpdate)` event.                                 |
| `onRowsDelete()`   | Handler for `lib-table` `(onRowsDelete)` event.                                 |
| `onEdit()`         | Handler for `lib-table` `(onEdit)` event. Sets `isEditing` flag.                |
| `onCancel()`       | Handler for `lib-table` `(onCancel)` event. Requires data signal as second arg. |
| `saveAllPending()` | Validates and sends all pending changes via `forkJoin`.                         |
| `addNewRow()`      | Prepends a new editable row to the given data signal.                           |

### BulkCrudApi Interface

```typescript
export interface BulkCrudApi<T = any> {
  bulkCreate?: (payload: Partial<T>[]) => Observable<ApiResponse<any>>;
  bulkUpdate?: (payload: Partial<T>[]) => Observable<ApiResponse<any>>;
  bulkDelete?: (ids: string[]) => Observable<ApiResponse<any>>;
}
```

> All methods are **optional**. If `bulkDelete` is not provided, the delete step is skipped during `saveAllPending()`.

## 💡 Inheritance Chain

```
BaseListDirective          → pagination, loading, fetchData, handlePageChange, handleError
  └─ BaseBulkCrudDirective → bulk state, event handlers, saveAllPending, addNewRow
       └─ YourComponent    → data signal, columns, API config, search form, fetchData
```

## ✅ Before vs After

### Before (per screen): ~150 lines of boilerplate

- `draftRows`, `modifiedRows`, `deletedRows` signals
- `hasPendingChanges` computed
- `onRowsCreate()`, `onRowsUpdate()`, `onRowsDelete()` handlers
- `onEdit()`, `onCancel()` handlers
- `saveAllPending()` with validation + `forkJoin`
- Payload extraction logic

### After (per screen): ~10 lines of config

```typescript
editableFields = ['code_type', 'code', 'description'];

override bulkCrudApi: BulkCrudApi = {
  bulkCreate: (payload) => this.service.createMany(payload),
  bulkUpdate: (payload) => this.service.updateMany(payload),
  bulkDelete: (ids) => this.service.deleteMany(ids),
};
```
