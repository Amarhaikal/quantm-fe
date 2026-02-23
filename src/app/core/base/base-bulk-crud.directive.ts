import { computed, Directive, inject, signal } from '@angular/core';
import { BaseListDirective } from './base-list.directive';
import { ConfirmService } from '../services/confirm.service';
import { ApiResponse } from '../models/api.model';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';

/**
 * Result of a bulk operation to track partial successes.
 */
interface BulkOpResult {
  type: 'create' | 'update' | 'delete';
  success: boolean;
  error?: any;
}

/**
 * Configuration for the bulk CRUD API calls.
 * Each feature component provides its own service methods.
 */
export interface BulkCrudApi<T = any> {
  /** Bulk create API call. Receives an array of payloads. */
  bulkCreate?: (payload: Partial<T>[]) => Observable<ApiResponse<any>>;
  /** Bulk update API call. Receives an array of payloads with `id`. */
  bulkUpdate?: (payload: Partial<T>[]) => Observable<ApiResponse<any>>;
  /** Bulk delete API call. Receives an array of IDs. */
  bulkDelete?: (ids: string[]) => Observable<ApiResponse<any>>;
}

/**
 * BaseBulkCrudDirective
 *
 * Extends BaseListDirective with bulk create/update/delete state management.
 * Eliminates boilerplate for screens that use `lib-table` with inline editing.
 *
 * ## Usage
 * ```ts
 * export class MyComponent extends BaseBulkCrudDirective implements OnInit {
 *   data = signal<any[]>([]);
 *   editableFields = ['code_type', 'code', 'description'];
 *
 *   override bulkCrudApi: BulkCrudApi = {
 *     bulkCreate: (payload) => this.myService.bulkCreate(payload),
 *     bulkUpdate: (payload) => this.myService.bulkUpdate(payload),
 *     bulkDelete: (ids) => this.myService.bulkDelete(ids),
 *   };
 *
 *   addRow() {
 *     this.addNewRow(this.data, { code: '', description: '' });
 *   }
 * }
 * ```
 */
@Directive()
export abstract class BaseBulkCrudDirective extends BaseListDirective {
  protected confirmService = inject(ConfirmService);

  /** Subclass must define which API methods to use for bulk operations. */
  abstract bulkCrudApi: BulkCrudApi;

  /**
   * Subclass must define which fields to extract for create/update payloads.
   * Example: `['code_type', 'code', 'description']`
   */
  abstract editableFields: string[];

  // ─── Bulk State ───────────────────────────────────────────────────────

  draftRows = signal<any[]>([]);
  modifiedRows = signal<any[]>([]);
  deletedRows = signal<any[]>([]);

  hasPendingChanges = computed(
    () =>
      this.draftRows().length > 0 ||
      this.modifiedRows().length > 0 ||
      this.deletedRows().length > 0,
  );

  // ─── Table Event Handlers ─────────────────────────────────────────────

  /** Called by lib-table (onRowsCreate). Tracks new draft rows. */
  onRowsCreate(drafts: any[]) {
    this.draftRows.set(drafts);
  }

  /** Called by lib-table (onRowsUpdate). Tracks modified existing rows. */
  onRowsUpdate(modified: any[]) {
    this.modifiedRows.set(modified);
  }

  /** Called by lib-table (onRowsDelete). Tracks rows marked for deletion. */
  onRowsDelete(marked: any[]) {
    this.deletedRows.set(marked);
  }

  /** Called by lib-table (onEdit). Enters editing mode for a row. */
  onEdit(rowData: any) {
    rowData.isEditing = true;
  }

  /**
   * Called by lib-table (onCancel).
   * Removes drafts or reverts editing/modified/deletion state.
   */
  onCancel(rowData: any, dataSignal: ReturnType<typeof signal<any[]>>) {
    if (rowData.id === 0) {
      // Remove the row (editing or draft) from the list
      dataSignal.update((data) => data.filter((item) => item !== rowData));
      if (rowData.isDraft) {
        this.draftRows.update((d) => d.filter((item) => item !== rowData));
      }
    } else {
      rowData.isEditing = false;
      rowData.isModified = false;
      rowData.isMarkedForDeletion = false;
      this.fetchData();
    }
  }

  // ─── Bulk Save ────────────────────────────────────────────────────────

  /**
   * Saves all pending changes (create + update + delete) in parallel via forkJoin.
   * Validates that all editable fields in draft/modified rows are non-empty.
   */
  saveAllPending() {
    const drafts = this.draftRows();
    const modified = this.modifiedRows();
    const deleted = this.deletedRows();

    if (!drafts.length && !modified.length && !deleted.length) return;

    // Validate required fields on create/update rows
    const allPending = [...drafts, ...modified];
    const invalid = allPending.find((r) => this.editableFields.some((f) => !r[f]));
    if (invalid) {
      this.toastService.error('Validation Error', 'All fields in pending rows are required');
      return;
    }

    this.confirmService.confirmSave(() => {
      this.loading.set(true);
      const requests: Observable<BulkOpResult>[] = [];

      // Bulk create
      if (drafts.length && this.bulkCrudApi.bulkCreate) {
        const payload = drafts.map((r) => this.extractPayload(r));
        requests.push(
          this.bulkCrudApi.bulkCreate(payload).pipe(
            map(() => ({ type: 'create' as const, success: true })),
            catchError((error) => of({ type: 'create' as const, success: false, error })),
          ),
        );
      }

      // Bulk update — send only changed fields + id per row
      if (modified.length && this.bulkCrudApi.bulkUpdate) {
        const payload = modified.map((r) => ({ id: r.id, ...this.extractUpdatePayload(r) }));
        requests.push(
          this.bulkCrudApi.bulkUpdate(payload).pipe(
            map(() => ({ type: 'update' as const, success: true })),
            catchError((error) => of({ type: 'update' as const, success: false, error })),
          ),
        );
      }

      // Bulk delete
      if (deleted.length && this.bulkCrudApi.bulkDelete) {
        const ids = deleted.map((r) => r.id);
        requests.push(
          this.bulkCrudApi.bulkDelete(ids).pipe(
            map(() => ({ type: 'delete' as const, success: true })),
            catchError((error) => of({ type: 'delete' as const, success: false, error })),
          ),
        );
      }

      forkJoin(requests).subscribe({
        next: (results) => {
          let anySuccess = false;

          results.forEach((res) => {
            if (res.success) {
              anySuccess = true;
              if (res.type === 'create') {
                this.toastService.createSuccess();
                this.draftRows.set([]);
              } else if (res.type === 'update') {
                this.toastService.updateSuccess();
                this.modifiedRows.set([]);
              } else if (res.type === 'delete') {
                this.toastService.deleteSuccess();
                this.deletedRows.set([]);
              }
            } else {
              if (res.type === 'create') this.toastService.createFailed(res.error);
              else if (res.type === 'update') this.toastService.updateFailed(res.error);
              else if (res.type === 'delete') this.toastService.deleteFailed(res.error);
            }
          });

          if (anySuccess) {
            this.fetchData();
          } else {
            this.loading.set(false);
          }
        },
        error: (error) => {
          // This should rarely be hit since we use catchError inside requests
          this.toastService.error('Error', 'An unexpected error occurred during bulk save');
          console.error(error);
          this.loading.set(false);
        },
      });
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────

  /**
   * Adds a new editable row at the top of the data signal.
   * @param dataSignal - The signal holding the table data array.
   * @param defaults - Default values for the new row fields.
   */
  protected addNewRow(
    dataSignal: ReturnType<typeof signal<any[]>>,
    defaults: Record<string, any> = {},
  ) {
    dataSignal.update((data) => [{ id: 0, isEditing: true, ...defaults } as any, ...data]);
  }

  /** Extracts only the editable fields from a row for CREATE payloads. */
  private extractPayload(row: any): Record<string, any> {
    const payload: Record<string, any> = {};
    for (const field of this.editableFields) {
      payload[field] = row[field];
    }
    return payload;
  }

  /**
   * Extracts only the CHANGED fields from a row for UPDATE payloads.
   * Uses _changedFields set by TableComponent during handleSave.
   * Falls back to all editableFields if _changedFields is not available.
   */
  private extractUpdatePayload(row: any): Record<string, any> {
    const fields: string[] = row._changedFields ?? this.editableFields;
    const payload: Record<string, any> = {};
    for (const field of fields) {
      payload[field] = row[field];
    }
    return payload;
  }

  /** Resets all pending state after a successful save. */
  private clearPendingState() {
    this.draftRows.set([]);
    this.modifiedRows.set([]);
    this.deletedRows.set([]);
  }
}
