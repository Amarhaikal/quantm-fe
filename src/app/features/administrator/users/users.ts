import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
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
import { CodeTypeService } from '../../../core/services/code-type.service';
import { CODE_TYPES } from '../../../core/constants/code-types.constants';
import { ConfirmService } from '../../../core/services/confirm.service';
import { BaseListDirective } from '../../../core/base/base-list.directive';
import { CrudUtils } from '../../../core/utils/crud.utils';

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
  ],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users extends BaseListDirective implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private codeTypeService = inject(CodeTypeService);
  private confirmService = inject(ConfirmService);

  users = signal<any[]>([]);

  searchForm = this.fb.group({
    username: [''],
    fullname: [''],
    role: [null],
  });

  rolesOptions = computed<OptionDropdown[]>(() => {
    return this.codeTypeService.getSystemCodes(CODE_TYPES.USER_ROLE).map((role) => ({
      value: role.code,
      label: role.description,
    }));
  });

  columns: TableColumn[] = [
    { field: 'username', header: 'label.username' },
    { field: 'fullname', header: 'label.full_name' },
    { field: 'email', header: 'label.email' },
    { field: 'role', header: 'label.role' },
    { field: 'status', header: 'label.status', type: 'badge' },
  ];

  ngOnInit() {
    this.fetchData();

    this.searchForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.fetchData(value);
      });
  }

  fetchData(params: any = this.searchForm.value) {
    this.loading.set(true);

    const apiParams = {
      ...CrudUtils.filterApiParams(params),
      page_no: this.pageNo(),
      page_size: this.pageSize(),
    };

    this.userService.getUsers(apiParams).subscribe({
      next: (response: ApiResponse<any>) => {
        const mappedData = response.data.data.map((user: any) => ({
          ...user,
          role: user.role?.description,
          status: user.status?.description,
          status_severity: CrudUtils.getStatusSeverity(user.status?.code),
        }));
        this.users.set(mappedData);
        this.totalRecords.set(response.data.total_count);
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
}
