import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { TextboxComponent } from '../../../shared/components/form/textbox/textbox';
import {
  DropdownComponent,
  OptionDropdown,
} from '../../../shared/components/form/dropdown/dropdown';
import { ButtonComponent } from '../../../shared/components/button/button';
import { TableComponent } from '../../../shared/components/data/table/table';
import { TableColumn } from '../../../shared/components/data/table/table.model';
import { PageHeaderComponent } from '../../../shared/components/layout/page-header/page-header';
import { PageContainerComponent } from '../../../shared/components/layout/page-container/page-container';
import { SearchComponent } from '../../../shared/components/layout/search/search';
import { UserService } from '../../../core/services/user.service';
import { ApiResponse } from '../../../core/models/api.model';
import { SystemCodeService } from '../../../core/services/system-code.service';
import { CODE_TYPES } from '../../../core/constants/code-types.constants';
import { ConfirmService } from '../../../core/services/confirm.service';
import { BaseListDirective } from '../../../core/base/base-list.directive';
import { CrudUtils } from '../../../core/utils/crud.utils';
import { environment } from '../../../../environments/environment';
import { CardListComponent } from '../../../shared/components/data/card-list/card-list';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TextboxComponent,
    DropdownComponent,
    ButtonComponent,
    TableComponent,
    PageHeaderComponent,
    PageContainerComponent,
    SearchComponent,
    CardListComponent,
    AvatarModule,
  ],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users extends BaseListDirective implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private systemCodeService = inject(SystemCodeService);
  private confirmService = inject(ConfirmService);

  users = signal<any[]>([]);
  viewMode = signal<'table' | 'card'>('table'); // Default to table view

  readonly severityClasses: Record<string, string> = {
    success: 'bg-green-100 text-green-800',
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    secondary: 'bg-gray-100 text-gray-800',
  };

  searchForm = this.fb.group({
    username: [''],
    fullname: [''],
    role: [null],
    status: [null],
  });

  rolesOptions = computed<OptionDropdown[]>(() => {
    return this.systemCodeService.getSystemCodes(CODE_TYPES.USER_ROLE).map((role) => ({
      value: role.code,
      label: role.description,
    }));
  });

  statusOptions = computed<OptionDropdown[]>(() => {
    return this.systemCodeService.getSystemCodes(CODE_TYPES.USER_STATUS).map((role) => ({
      value: role.code,
      label: role.description,
    }));
  });

  columns: TableColumn[] = [
    {
      field: 'username',
      header: 'label.username',
      type: 'avatarText',
      imageField: 'profile_photo',
    },
    { field: 'fullname', header: 'label.full_name' },
    { field: 'staff_no', header: 'label.staff_no' },
    { field: 'role', header: 'label.role' },
    { field: 'status', header: 'label.status', type: 'badge', textAlign: 'center' },
  ];

  ngOnInit() {
    console.log('deployed');

    this.fetchData();

    this.searchForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.fetchData(value);
      });
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

    this.userService.getUsers(apiParams).subscribe({
      next: (response: ApiResponse<any>) => {
        const baseUrl = environment.apiUrl.endsWith('/')
          ? environment.apiUrl.slice(0, -1)
          : environment.apiUrl;
        const mappedData = response.result.data.map((user: any) => ({
          ...user,
          role: user.role?.description,
          status: user.status?.description,
          status_severity: CrudUtils.getStatusSeverity(user.status?.code),
          profile_photo: user.profile_photo ? `${baseUrl}/api${user.profile_photo}` : null,
        }));

        console.log('mappeData', mappedData);
        this.users.set(mappedData);
        this.totalRecords.set(response.result.total_count);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.handleError(error, 'Failed to fetch users');
      },
    });
  }

  addUser() {
    this.router.navigate(['users/add'], { relativeTo: this.route.parent });
  }

  onEdit(user: any) {
    this.router.navigate(['users', user.id || user.username], { relativeTo: this.route.parent });
  }

  resetSearch() {
    this.searchForm.reset();
    this.pageNo.set(1);
  }

  handleDelete(user: any) {
    this.confirmService.confirmDelete(
      () => {
        this.loading.set(true);
        this.userService.deleteUser(user.id).subscribe({
          next: (response) => {
            if (response.status === 200) {
              this.toastService.deleteSuccess();
              this.fetchData();
            } else {
              this.toastService.deleteFailed({
                error: { message: response.message || 'Failed to delete user' },
              });
              this.loading.set(false);
            }
          },
          error: (error) => {
            this.toastService.deleteFailed(error);
            this.loading.set(false);
          },
        });
      },
      { name: user.fullname },
    );
  }

  toggleView(mode: 'table' | 'card') {
    this.viewMode.set(mode);
  }
}
