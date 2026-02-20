import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { SessionActivityService } from '../../../core/services/session-activity.service';
import { FormBuilder } from '@angular/forms';
import { CodeTypeService } from '../../../core/services/code-type.service';
import {
  DropdownComponent,
  OptionDropdown,
} from '../../../shared/components/form/dropdown/dropdown';
import { CODE_TYPES } from '../../../core/constants/code-types.constants';
import { TableColumn } from '../../../shared/components/data/table/table.model';
import { CrudUtils } from '../../../core/utils/crud.utils';
import { PageContainerComponent } from '../../../shared/components/layout/page-container/page-container';
import { PageHeaderComponent } from '../../../shared/components/layout/page-header/page-header';
import { TextboxComponent } from '../../../shared/components/form/textbox/textbox';
import { SearchComponent } from '../../../shared/components/layout/search/search';
import { ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { TableComponent } from '../../../shared/components/data/table/table';
import { ConfirmService } from '../../../core/services/confirm.service';
@Component({
  selector: 'app-session-activities',
  imports: [
    PageContainerComponent,
    PageHeaderComponent,
    SearchComponent,
    TextboxComponent,
    DropdownComponent,
    ReactiveFormsModule,
    TableComponent,
  ],
  templateUrl: './session-activities.html',
  styleUrl: './session-activities.css',
})
export class SessionActivities implements OnInit {
  private sessionActivityService = inject(SessionActivityService);
  protected fb = inject(FormBuilder);
  protected codeTypeService = inject(CodeTypeService);
  private confirmService = inject(ConfirmService);

  loading = signal<boolean>(false);
  pageNo = signal<number>(1);
  pageSize = signal<number>(10);

  data = signal<any[]>([]);
  totalRecords = signal<number>(0);

  ngOnInit(): void {
    this.fetchData();

    this.searchForm.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
      this.fetchData();
    });
  }

  searchForm = this.fb.group({
    username: [''],
    fullname: [''],
    role: [''],
    status: [''],
  });

  rolesOptions = computed<OptionDropdown[]>(() => {
    return this.codeTypeService.getSystemCodes(CODE_TYPES.USER_ROLE).map((role) => ({
      value: role.code,
      label: role.description,
    }));
  });

  statusOptions = computed<OptionDropdown[]>(() => {
    return [
      { value: 'ACTIVE', label: 'Active' },
      { value: 'INACTIVE', label: 'Inactive' },
    ];
  });

  columns: TableColumn[] = [
    {
      field: 'username',
      header: 'label.username',
    },
    {
      field: 'role',
      header: 'label.role',
    },
    {
      field: 'created_at',
      header: 'label.logged_in_at',
      type: 'datetime',
      textAlign: 'center',
    },
    {
      field: 'expires_at',
      header: 'label.expires_at',
      type: 'datetime',
      textAlign: 'center',
    },
    {
      field: 'last_activity_at',
      header: 'label.last_activity_at',
      type: 'datetime',
      textAlign: 'center',
    },
    {
      field: 'logged_out_at',
      header: 'label.logged_out_at',
      type: 'datetime',
      textAlign: 'center',
    },
    {
      field: 'logout_reason',
      header: 'label.logout_reason',
    },
    {
      field: 'is_active',
      header: 'label.status',
      textAlign: 'center',
      type: 'badge',
    },
  ];

  fetchData(params: any = this.searchForm.value) {
    this.loading.set(true);

    let apiParams = {
      is_active: params.status === 'ACTIVE' ? true : params.status === 'INACTIVE' ? false : null,
      ...CrudUtils.filterApiParams(params),
      page_no: this.pageNo(),
      page_size: this.pageSize(),
    };

    if (apiParams.is_active === null) {
      delete apiParams.is_active;
    }

    this.sessionActivityService.getSessionActivities(apiParams).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.data.set(this.refactorData(response.data.list));
        this.totalRecords.set(response.data.total_count);
      },
      error: (error) => {
        this.loading.set(false);
      },
    });
  }

  refactorData(data: any[]) {
    return data.map((item: any) => ({
      ...item,
      username: item.user?.username,
      fullname: item.user?.fullname,
      role: item.user?.role?.description,
      is_active_severity: CrudUtils.getStatusSeverity(item.is_active ? 'A' : 'I'),
      is_active: item.is_active ? 'Active' : 'Inactive',
    }));
  }

  resetSearch() {
    this.searchForm.reset();
    this.pageNo.set(1);
  }

  handlePageChange(event: any) {
    this.pageNo.set(event.first / event.rows + 1);
    this.pageSize.set(event.rows);
    this.fetchData();
  }

  handleDelete(e: any) {
    this.confirmService.confirmEndSession(() => {
      this.sessionActivityService.endSession(e.id).subscribe({
        next: (response) => {
          this.fetchData();
        },
        error: (error) => {
          this.loading.set(false);
        },
      });
    });
  }
}
