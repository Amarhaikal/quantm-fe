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

  users = signal<any[]>([]);
  loading = signal<boolean>(false);

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
    { field: 'fullname', header: 'label.full_name' },
    { field: 'username', header: 'label.username' },
    { field: 'email', header: 'label.email' },
    { field: 'role', header: 'label.role' },
    { field: 'status', header: 'label.status' },
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
      page_no: 1,
      page_size: 10,
    };

    this.userService.getUsers(apiParams).subscribe({
      next: (response: ApiResponse<any>) => {
        console.log('User list API response:', response);
        const mappedData = response.data.data.map((user: any) => ({
          ...user,
          role: user.role?.description || '-',
          status: user.status?.description || '-',
        }));
        this.users.set(mappedData);
        console.log('Mapped user data:', this.users());
        this.loading.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to fetch users:', error);
        this.loading.set(false);
      },
    });
  }

  resetSearch() {
    this.searchForm.reset();
    console.log('Search reset');
  }
}
