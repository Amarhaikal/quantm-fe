# Table Component

The `TableComponent` is a reusable data table component built on top of PrimeNG's `p-table`. It provides features like pagination, sorting, row selection, and standardized action buttons (Edit, Delete, View).

## Overview

- **Selector**: `lib-table`
- **Standalone**: Yes
- **Change Detection**: `OnPush`

## Usage

```html
<lib-table
  [data]="users()"
  [columns]="searchColumns"
  [loading]="loading()"
  [totalRecords]="totalRecords()"
  [rows]="pageSize()"
  actionType="DETAILS_DELETE"
  (onPageChange)="handlePageChange($event)"
  (onDelete)="handleDelete($event)"
/>
```

```typescript
searchColumns: TableColumn[] = [
  { field: 'username', header: 'label.username' },
  { field: 'fullname', header: 'label.full_name' },
  { field: 'email', header: 'label.email' },
  { field: 'role', header: 'label.role' },
  { field: 'status', header: 'label.status', type: 'badge' },
];
```

## API

### Inputs

| Property       | Type            | Default  | Description                                |
| :------------- | :-------------- | :------- | :----------------------------------------- |
| `data`         | `any[]`         | `[]`     | The array of data to display in the table. |
| `columns`      | `TableColumn[]` | `[]`     | configuration for table columns.           |
| `loading`      | `boolean`       | `false`  | Shows a loading indicator when true.       |
| `rowHover`     | `boolean`       | `true`   | Enables/disables row highlights on hover.  |
| `actionType`   | `ActionType`    | `'NONE'` | Controls which action buttons are shown.   |
| `totalRecords` | `number`        | `0`      | Total number of records for pagination.    |
| `rows`         | `number`        | `10`     | Number of rows per page.                   |
| `first`        | `number`        | `0`      | Index of the first record to display.      |

### Outputs

| Event          | Type    | Description                                                              |
| :------------- | :------ | :----------------------------------------------------------------------- |
| `onRowSelect`  | `any`   | Emitted when a row is clicked.                                           |
| `onPageChange` | `any`   | Emitted when the page changes or rows per page changes.                  |
| `onEdit`       | `any`   | Emitted when the individual edit button is clicked.                      |
| `onDelete`     | `any`   | Emitted when the individual delete button is clicked.                    |
| `onView`       | `any`   | Emitted when the individual view button is clicked.                      |
| `onSave`       | `any`   | Emitted when ✔ is clicked on an editing row.                             |
| `onCancel`     | `any`   | Emitted when ✗ is clicked on an editing, draft, or modified row.         |
| `onRowsCreate` | `any[]` | Emitted with all current draft rows when a new row is saved.             |
| `onRowsUpdate` | `any[]` | Emitted with all current modified rows when an existing row is saved.    |
| `onRowsDelete` | `any[]` | Emitted with all current marked-for-deletion rows when a row is toggled. |

## Interfaces

### TableColumn

```typescript
export interface TableColumn {
  field: string;
  header: string; // Transloco key
  width?: string; // e.g., '100px'
  textAlign?: 'left' | 'center' | 'right';
  type?: 'text' | 'date' | 'datetime' | 'badge' | 'action';
  editable?: boolean; // Enables inline editing for this column
  required?: boolean; // Marks the field as required during inline editing
  inputType?: 'text' | 'dropdown' | 'date' | 'number'; // Input type when editing
  options?: any[]; // Options for dropdown inputType (OptionDropdown[])
  minlength?: number; // Minimum character length for text inputs
  maxlength?: number; // Maximum character length for text inputs
  sortable?: boolean; // Defaults to true; set to false to disable sorting for this column
}
```

### ActionType

```typescript
export type ActionType =
  | 'EDIT' // Edit button only
  | 'DELETE' // Single-delete button (confirm dialog)
  | 'DELETES' // Bulk-delete button (mark for deletion)
  | 'EDIT_DELETE' // Edit + single-delete button
  | 'EDIT_DELETES' // Edit + bulk-delete button
  | 'DETAILS' // View button only
  | 'DETAILS_DELETE' // View + single-delete button
  | 'DETAILS_DELETES' // View + bulk-delete button
  | 'NONE'; // No action buttons
```

## Features

### Automatic Empty State

If a field value is `null`, `undefined`, or an empty string `''`, the component will automatically display a hyphen `-` instead of an empty cell. This applies to all column types.

### Date Formatting

The component supports automatic date formatting:

- `date`: Formats the value as `dd/MM/yyyy` (e.g., `18/02/2026`).
- `datetime`: Formats the value as `dd/MM/yyyy HH:mm:ss` (e.g., `18/02/2026 23:30:00`).

### Badge Support

If a column type is set to `'badge'`, the component looks for a field named `[field]_severity` in the row data to determine the badge color.

Example data structure for a badge column `status`:

```json
{
  "status": "Active",
  "status_severity": "success"
}
```

### Sorting

All columns are sortable by default unless `sortable: false` is explicitly set in their `TableColumn` definition.

The table uses a **Tri-State Server-Side Sort** mechanism:

- **First click** on a header: Sorts ascending (triggers `onSort` with `order: 1`).
- **Second click**: Sorts descending (triggers `onSort` with `order: -1`).
- **Third click**: Removes sorting (triggers `onSort` with `field: null, order: null` and table visually resets).

Parent components should consume the `(onSort)` event or inherit from `BaseListDirective` to handle automatic API parameter insertion (`sort_by` and `sort_order`).

### Standard Actions

Buttons are automatically rendered based on the `actionType` input. There are two delete modes:

#### Single Delete (`DELETE` / `EDIT_DELETE` / `DETAILS_DELETE`)

Clicking the trash icon immediately emits `onDelete` to the parent, which handles a confirm-dialog flow.

#### Bulk Delete (`DELETES` / `EDIT_DELETES` / `DETAILS_DELETES`)

Clicking the trash icon **marks the row** for deletion (rose background, strikethrough, undo button). Rows are actually deleted only when the parent calls `saveAllPending()`.

| `actionType`      | View (👁) | Edit (✏) | Delete (🗑) | Delete Mode |
| :---------------- | :-------: | :------: | :---------: | :---------- |
| `NONE`            |           |          |             | —           |
| `EDIT`            |           |    ✅    |             | —           |
| `DELETE`          |           |          |     ✅      | Single      |
| `DELETES`         |           |          |     ✅      | Bulk        |
| `EDIT_DELETE`     |           |    ✅    |     ✅      | Single      |
| `EDIT_DELETES`    |           |    ✅    |     ✅      | Bulk        |
| `DETAILS`         |    ✅     |          |             | —           |
| `DETAILS_DELETE`  |    ✅     |          |     ✅      | Single      |
| `DETAILS_DELETES` |    ✅     |          |     ✅      | Bulk        |

> **Note**: The "View" action navigates to `admin/users/:id` by default if an ID is present, while also emitting the `onView` event.

### Empty State

When no data is provided, a standard "No data found" message is displayed with an icon.

### Inline Editing

The table supports inline editing for columns marked with `editable: true`. When the edit button is clicked, the row switches to editing mode and renders the appropriate input component (`lib-textbox` or `lib-dropdown`) based on the column's `inputType`.

- Inputs are rendered with `[isTable]="true"` for compact styling (`h-8`, reduced padding).
- Columns with `required: true` will show immediate validation for empty fields.
- Pre-filled fields (editing existing data) will **not** show false validation errors on initial render.

### Draft Rows (Bulk Create)

New rows added via an "Add" button start in **editing mode** with `id: 0`. When confirmed (✔), they become **draft rows**:

- Draft rows are highlighted with an **indigo** background (`bg-indigo-100`).
- Draft rows are tracked via the `onRowsCreate` output.
- A cancel button (✗) removes the draft.
- All drafts can be saved in bulk using the parent component's save logic.

### Modified Rows (Bulk Update)

When an existing row is edited and confirmed (✔), it becomes a **modified row**:

- Modified rows are highlighted with an **amber** background (`bg-amber-100`).
- Modified rows are tracked via the `onRowsUpdate` output.
- A cancel button (✗) reverts the modification and re-fetches data.
- All modifications can be saved in bulk using the parent component's save logic.

### Marked for Deletion (Bulk Delete)

Only available when using a `*_DELETES` action type (`DELETES`, `EDIT_DELETES`, `DETAILS_DELETES`).

When the delete button (🗑) is clicked on a row, it enters a **marked for deletion** state:

- Row is highlighted with a **rose** background (`bg-rose-100`), **strikethrough** text, and **reduced opacity**.
- The trash button is replaced by an **undo** button (↩) to reverse the mark.
- Marked rows are tracked via the `onRowsDelete` output.
- Rows are **not** deleted immediately — the parent collects all marked rows and sends a bulk delete API request when the Save button is clicked.

> Use `DELETE` / `EDIT_DELETE` / `DETAILS_DELETE` for screens that require an immediate single-row confirm-and-delete dialog.

## Advanced Example

### Basic Table with Pagination

```typescript
// users.ts
handlePageChange(event: any) {
  this.pageNo.set(event.first / event.rows + 1);
  this.pageSize.set(event.rows);
  this.fetchData();
}

handleDelete(item: any) {
  this.confirmService.confirmDelete(() => {
    this.service.delete(item.id).subscribe(...);
  }, { name: item.name });
}
```

### Inline Editing with Bulk Create & Update

```html
<lib-table
  [columns]="columns()"
  [data]="systemCodes()"
  [loading]="loading()"
  [totalRecords]="totalRecords()"
  [rows]="pageSize()"
  actionType="EDIT_DELETES"
  (onPageChange)="handlePageChange($event)"
  (onCancel)="onCancel($event)"
  (onEdit)="onEdit($event)"
  (onRowsCreate)="onRowsCreate($event)"
  (onRowsUpdate)="onRowsUpdate($event)"
  (onRowsDelete)="onRowsDelete($event)"
/>
```

```typescript
// Editable column definitions with validation constraints
columns = computed<TableColumn[]>(() => [
  {
    field: 'code_type',
    header: 'label.code_type',
    width: '300px',
    editable: true,
    required: true,
    inputType: 'dropdown',
    options: this.codeTypesOptions(),
  },
  {
    field: 'code',
    header: 'label.code',
    width: '180px',
    editable: true,
    required: true,
    inputType: 'text',
    maxlength: 10,
  },
  {
    field: 'description',
    header: 'label.description',
    width: '240px',
    editable: true,
    required: true,
    inputType: 'text',
    minlength: 3,
    maxlength: 60,
  },
]);
```

### Single Delete (Users screen)

```html
<lib-table
  [columns]="columns"
  [data]="users()"
  [loading]="loading()"
  [totalRecords]="totalRecords()"
  [rows]="pageSize()"
  actionType="DETAILS_DELETE"
  (onPageChange)="handlePageChange($event)"
  (onDelete)="handleDelete($event)"
/>
```

```typescript
handleDelete(item: any) {
  this.confirmService.confirmDelete(() => {
    this.service.delete(item.id).subscribe(...);
  }, { name: item.name });
}
```
