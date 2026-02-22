You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.
- Do not write arrow functions in templates (they are not supported).

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## Main Listing Screen Convention

Every feature "main screen" (list/grid view) MUST follow these conventions:

### Screen Structure

A main listing screen consists of three logical sections rendered inside `<app-page-container>`:

1. **`<app-page-header>`** — page title only.
2. **`<app-search>`** — search/filter bar. Always includes `(reset)` event binding calling `resetSearch()`.
3. **`<app-table>`** — the data table.

### Two Screen Variants

#### Variant A — Read-Only List (navigate to edit page)

Use when rows open a separate detail/form page on click (e.g. Users).

- Extend **`BaseListDirective`**.
- Define `searchForm` with `this.fb.group({...})`.
- Define `columns: TableColumn[]` as a plain array (not `computed`).
- Implement `fetchData(params?)` that calls the service and maps the result into the data signal.
- Implement `addXxx()` that navigates via `Router`.
- Implement `onEdit(row)` that navigates to the detail route.
- Implement `handleDelete(row)` using `ConfirmService.confirmDelete()`.
- Implement `resetSearch()` that resets the form and resets `pageNo` to 1.
- Wire `searchForm.valueChanges` with `debounceTime(300)` and `distinctUntilChanged()` to call `fetchData()`.

```typescript
// ✅ Variant A — extend BaseListDirective
export class Foos extends BaseListDirective implements OnInit {
  private fooService = inject(FooService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private confirmService = inject(ConfirmService);

  foos = signal<Foo[]>([]);

  searchForm = this.fb.group({
    name: [''],
  });

  columns: TableColumn[] = [
    { field: 'name', header: 'label.name' },
    { field: 'status', header: 'label.status', type: 'badge' },
  ];

  ngOnInit() {
    this.fetchData();
    this.searchForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => this.fetchData(value));
  }

  fetchData(params: any = this.searchForm.value) {
    this.loading.set(true);
    const apiParams: any = {
      ...CrudUtils.filterApiParams(params),
      page_no: this.pageNo(),
      page_size: this.pageSize(),
    };

    if (this.sortField()) {
      apiParams.sort_by = this.sortField();
      apiParams.sort_order = this.sortOrder() === 1 ? 'asc' : 'desc';
    }

    this.fooService.getFoos(apiParams).subscribe({
      next: (response: ApiResponse<any>) => {
        this.foos.set(response.data.list);
        this.totalRecords.set(response.data.total_count);
        this.loading.set(false);
      },
      error: (error: unknown) => this.handleError(error, 'Failed to fetch foos'),
    });
  }

  addFoo() {
    this.router.navigate(['foos/add'], { relativeTo: this.route.parent });
  }

  onEdit(row: Foo) {
    this.router.navigate(['foos', row.id], { relativeTo: this.route.parent });
  }

  handleDelete(row: Foo) {
    this.confirmService.confirmDelete(
      () => {
        this.loading.set(true);
        this.fooService.deleteFoo(row.id).subscribe({
          next: (response) => {
            if (response.status === 200) {
              this.toastService.deleteSuccess();
              this.fetchData();
            } else {
              this.toastService.deleteFailed({ error: { message: response.message } });
              this.loading.set(false);
            }
          },
          error: (error) => {
            this.toastService.deleteFailed(error);
            this.loading.set(false);
          },
        });
      },
      { name: row.name },
    );
  }

  resetSearch() {
    this.searchForm.reset();
    this.pageNo.set(1);
  }
}
```

#### Variant B — Inline-Editable Grid (save in grid)

Use when rows can be edited directly inside the table and saved in bulk (e.g. System Codes).

- Extend **`BaseBulkCrudDirective`**.
- Declare `editableFields: string[]` listing the field names that are editable.
- Override `bulkCrudApi: BulkCrudApi` with `bulkCreate`, `bulkUpdate`, and `bulkDelete` pointing to service methods.
- Define `columns` as `computed<TableColumn[]>(() => [...])` so it can react to dynamic options (e.g. dropdown options from signals).
- Each editable column MUST set `editable: true`, `inputType` (`'text'` or `'dropdown'`), and optionally `required`, `minlength`, `maxlength`.
- Implement `addXxx()` that calls `this.addNewRow(dataSignal, defaultValues)`.
- Override `onEdit(rowData)` if pre-processing is needed before editing.
- Override `onCancel(rowData)` passing the data signal: `super.onCancel(rowData, this.dataSignal)`.
- A **Save All** button MUST be present in the template, bound to `saveAllPending()` from the base class.

```typescript
// ✅ Variant B — extend BaseBulkCrudDirective
export class FooBars extends BaseBulkCrudDirective implements OnInit {
  private fooBarService = inject(FooBarService);

  fooBars = signal<FooBar[]>([]);
  editableFields = ['name', 'description'];

  override bulkCrudApi: BulkCrudApi = {
    bulkCreate: (payload) => this.fooBarService.createFooBars(payload),
    bulkUpdate: (payload) => this.fooBarService.updateFooBars(payload),
    bulkDelete: (ids) => this.fooBarService.deleteFooBars(ids),
  };

  searchForm = this.fb.group({
    name: [''],
    description: [''],
  });

  columns = computed<TableColumn[]>(() => [
    {
      field: 'name',
      header: 'label.name',
      editable: true,
      required: true,
      inputType: 'text',
      maxlength: 50,
    },
    {
      field: 'description',
      header: 'label.description',
      editable: true,
      inputType: 'text',
      maxlength: 100,
    },
    { field: 'created_by', header: 'label.created_by' },
    { field: 'created_at', header: 'label.created_at', type: 'datetime', textAlign: 'center' },
    { field: 'updated_by', header: 'label.updated_by' },
    { field: 'updated_at', header: 'label.updated_at', type: 'datetime', textAlign: 'center' },
  ]);

  ngOnInit() {
    this.fetchData();
    this.searchForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => this.fetchData(value));
  }

  fetchData(params: any = this.searchForm.value) {
    this.loading.set(true);
    const apiParams: any = {
      ...CrudUtils.filterApiParams(params),
      page_no: this.pageNo(),
      page_size: this.pageSize(),
    };

    if (this.sortField()) {
      apiParams.sort_by = this.sortField();
      apiParams.sort_order = this.sortOrder() === 1 ? 'asc' : 'desc';
    }

    this.fooBarService.getFooBars(apiParams).subscribe({
      next: (response: ApiResponse<any>) => {
        this.fooBars.set(response.data.list);
        this.totalRecords.set(response.data.total_count);
        this.loading.set(false);
      },
      error: (error: unknown) => this.handleError(error, 'Failed to fetch foo bars'),
    });
  }

  addFooBar() {
    this.addNewRow(this.fooBars, { name: '', description: '' });
  }

  override onCancel(rowData: any) {
    super.onCancel(rowData, this.fooBars);
  }

  resetSearch() {
    this.searchForm.reset();
    this.pageNo.set(1);
  }
}
```

### Model Convention (`src/app/core/models/`)

Every feature MUST have its own model file named `<feature>.model.ts`.

- Define the **main entity interface** (all fields returned by the API, snake_case).
- Nested reference objects from system codes use `SystemCodeReference` from `code-type.model.ts`.
- Audit fields (`created_by`, `created_at`, `updated_by`, `updated_at`) are always included.
- Define **DTO interfaces** for create/update payloads (suffix `CreateDto` / `UpdateDto`), only including writable fields.
- Export a **Response type alias** using `ApiResponse<Entity>`.

```typescript
// ✅ src/app/core/models/foo.model.ts
import { ApiResponse } from './api.model';
import { SystemCodeReference } from './code-type.model';

export interface Foo {
  id: number;
  name: string;
  status: SystemCodeReference;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string | null;
}

export interface FooCreateDto {
  name: string;
  status: { code: string };
}

export interface FooUpdateDto {
  name?: string;
  status?: { code: string };
}

export type FooResponse = ApiResponse<Foo>;
export type FooListResponse = ApiResponse<{ data: Foo[]; total_count: number }>;
```

### Service Convention (`src/app/core/services/`)

Every feature MUST have its own service file named `<feature>.service.ts`.

- Must be decorated with `@Injectable({ providedIn: 'root' })`.
- Inject `ApiService` using `inject()`.
- All methods return `Observable<ApiResponse<T>>` using the strongly-typed model types.
- For bulk-editable screens, expose `createXxxs`, `updateXxxs`, and `deleteXxxs` (plural bulk variants).
- NEVER duplicate `HttpClient` calls — always delegate to `ApiService.get/post/put/delete`.

```typescript
// ✅ src/app/core/services/foo.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/api.model';
import { Foo, FooCreateDto, FooListResponse, FooResponse, FooUpdateDto } from '../models/foo.model';

@Injectable({ providedIn: 'root' })
export class FooService {
  private api = inject(ApiService);

  // ── List ──────────────────────────────────────────────────────────────
  getFoos(params?: any): Observable<FooListResponse> {
    return this.api.get<FooListResponse>('foo/list', params);
  }

  // ── Single ────────────────────────────────────────────────────────────
  getFooById(id: number): Observable<FooResponse> {
    return this.api.get<FooResponse>(`foo/${id}`);
  }

  // ── Create ────────────────────────────────────────────────────────────
  createFoo(data: FooCreateDto): Observable<FooResponse> {
    return this.api.post<FooResponse>('foo', data);
  }

  // Bulk create (Variant B only)
  createFoos(data: FooCreateDto[]): Observable<ApiResponse<any>> {
    return this.api.post<ApiResponse<any>>('foo/bulk', data);
  }

  // ── Update ────────────────────────────────────────────────────────────
  updateFoo(id: number, data: FooUpdateDto): Observable<FooResponse> {
    return this.api.put<FooResponse>(`foo/${id}`, data);
  }

  // Bulk update (Variant B only)
  updateFoos(data: any[]): Observable<ApiResponse<any>> {
    return this.api.put<ApiResponse<any>>('foo/bulk', data);
  }

  // ── Delete ────────────────────────────────────────────────────────────
  deleteFoo(id: number): Observable<ApiResponse<any>> {
    return this.api.delete<ApiResponse<any>>(`foo/${id}`);
  }

  // Bulk delete (Variant B only)
  deleteFoos(ids: string[]): Observable<ApiResponse<any>> {
    return this.api.post<ApiResponse<any>>('foo/bulk/delete', ids);
  }
}
```

### Required Imports Checklist

For **Variant A** (read-only list):

```typescript
import { BaseListDirective } from '../../../core/base/base-list.directive';
import { CrudUtils } from '../../../core/utils/crud.utils';
import { ConfirmService } from '../../../core/services/confirm.service';
import { ApiResponse } from '../../../core/models/api.model';
import { debounceTime, distinctUntilChanged } from 'rxjs';
```

For **Variant B** (inline-editable grid):

```typescript
import { BaseBulkCrudDirective, BulkCrudApi } from '../../../core/base/base-bulk-crud.directive';
import { CrudUtils } from '../../../core/utils/crud.utils';
import { ApiResponse } from '../../../core/models/api.model';
import { debounceTime, distinctUntilChanged } from 'rxjs';
```

Both variants always include:

```typescript
import { ReactiveFormsModule } from '@angular/forms';
import { TableComponent } from '../../../shared/components/data/table/table';
import { TableColumn } from '../../../shared/components/data/table/table.model';
import { PageHeaderComponent } from '../../../shared/components/layout/page-header/page-header';
import { PageContainerComponent } from '../../../shared/components/layout/page-container/page-container';
import { SearchComponent } from '../../../shared/components/layout/search/search';
import { ButtonComponent } from '../../../shared/components/button/button';
```
