import { Component, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { TextboxComponent } from '../../../shared/components/textbox/textbox';
import { DropdownComponent, OptionDropdown } from '../../../shared/components/dropdown/dropdown';
import { ButtonComponent } from '../../../shared/components/button/button';
import { TableComponent } from '../../../shared/components/table/table';
import { TableColumn } from '../../../shared/components/table/table.model';
import { UserService } from '../../../core/services/user.service';
import { ApiResponse } from '../../../core/models/api.model';
import { CodeTypeService } from '../../../core/services/code-type.service';
import { CODE_TYPES } from '../../../core/constants/code-types.constants';
import { signal } from '@angular/core';
import { ConfirmService } from '../../../core/services/confirm.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-users',
  imports: [
    TranslocoPipe,
    ReactiveFormsModule,
    TextboxComponent,
    DropdownComponent,
    ButtonComponent,
    TableComponent,
  ],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private translocoService = inject(TranslocoService);
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private codeTypeService = inject(CodeTypeService);
  private confirmService = inject(ConfirmService);
  private toastService = inject(ToastService);

  users = signal<any[]>([]);
  loading = signal<boolean>(false);
  totalRecords = signal<number>(0);
  pageNo = signal<number>(1);
  pageSize = signal<number>(10);

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

  searchColumns: TableColumn[] = [
    // { field: 'id', header: 'ID', width: '80px' },
    { field: 'username', header: 'label.username' },
    { field: 'fullname', header: 'label.full_name' },
    { field: 'email', header: 'label.email' },
    { field: 'role', header: 'label.role' },
    { field: 'status', header: 'label.status', type: 'badge' },
  ];

  ngOnInit() {
    this.fetchUsers();

    this.searchForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        console.log('Searching with criteria:', value);
        this.fetchUsers(value);
      });
  }

  fetchUsers(params: any = this.searchForm.value) {
    this.loading.set(true);

    // Filter out null, undefined, or empty string values
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== ''),
    );

    const apiParams = {
      ...filteredParams,
      page_no: this.pageNo(),
      page_size: this.pageSize(),
    };

    this.userService.getUsers(apiParams).subscribe({
      next: (response: ApiResponse<any>) => {
        console.log('User list API response:', response);
        const mappedData = response.data.data.map((user: any) => ({
          ...user,
          role: user.role?.description,
          status: user.status?.description,
          status_severity: this.getStatusSeverity(user.status?.code),
        }));
        this.users.set(mappedData);
        this.totalRecords.set(response.data.total_count);
        console.log('Mapped user data:', this.users());
        this.loading.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to fetch users:', error);
        this.loading.set(false);
      },
    });
  }

  getStatusSeverity(code: string): any {
    console.log('Status code for severity:', code);
    switch (code) {
      case 'A':
        return 'success';
      case 'N':
        return 'info';
      // case 'I':
      //   return 'secondary';
      case 'D':
        return 'danger';
      case 'I':
        return 'warning';
      default:
        return 'secondary';
    }
  }

  addUser() {
    this.router.navigate(['users/add'], { relativeTo: this.route.parent });
  }

  handlePageChange(event: any) {
    this.pageNo.set(event.first / event.rows + 1);
    this.pageSize.set(event.rows);
    this.fetchUsers();
  }

  resetSearch() {
    this.searchForm.reset();
    this.pageNo.set(1);
    console.log('Search reset');
  }

  handleDelete(user: any) {
    this.confirmService.confirm({
      message: this.translocoService.translate('common.confirm_delete_message', {
        name: user.username,
      }),
      header: this.translocoService.translate('common.confirm_delete_header'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translocoService.translate('common.buttons.delete'),
      acceptButtonProps: { severity: 'danger', size: 'small' },
      rejectButtonProps: { severity: 'secondary', size: 'small', outlined: true },
      accept: () => {
        this.loading.set(true);
        this.userService.deleteUser(user.id).subscribe({
          next: (response) => {
            if (response.status === 200) {
              this.toastService.success('Success', 'User deleted successfully');
              this.fetchUsers();
            } else {
              this.toastService.error('Error', response.message || 'Failed to delete user');
              this.loading.set(false);
            }
          },
          error: (error) => {
            this.toastService.error('Error', error.error?.message || 'Failed to delete user');
            this.loading.set(false);
          },
        });
      },
    });
  }
}
