import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { TextboxComponent } from '../../../shared/components/textbox/textbox';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown';
import { ButtonComponent } from '../../../shared/components/button/button';

@Component({
  selector: 'app-users',
  imports: [
    TranslocoPipe,
    ReactiveFormsModule,
    TextboxComponent,
    DropdownComponent,
    ButtonComponent,
  ],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private translocoService = inject(TranslocoService);
  private fb = inject(FormBuilder);

  searchForm = this.fb.group({
    username: [''],
    fullName: [''],
    role: [null],
  });

  roles = [
    { label: 'Administrator', value: 'ADMIN' },
    { label: 'Manager', value: 'MANAGER' },
    { label: 'User', value: 'USER' },
  ];

  ngOnInit() {
    this.searchForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        console.log('Searching with criteria:', value);
      });
  }

  resetSearch() {
    this.searchForm.reset();
    console.log('Search reset');
  }
}
