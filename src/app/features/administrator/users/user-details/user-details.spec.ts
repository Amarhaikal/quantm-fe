import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserDetails } from './user-details';
import { UserService } from '../../../../core/services/user.service';
import { SystemCodeService } from '../../../../core/services/system-code.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { TranslocoTestingModule } from '@ngneat/transloco';
import { DatePipe } from '@angular/common';

describe('UserDetails', () => {
  let component: UserDetails;
  let fixture: ComponentFixture<UserDetails>;

  beforeEach(async () => {
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    const mockAuthService = {
      profileImageUrl: signal(''),
      triggerRefresh: () => {},
      currentUser: signal(null),
      updateProfileImage: () => {},
      hydrate: () => of(true),
      register: () => of({ status: 200, result: {} })
    };
    const mockUserService = {
      getCurrentUser: () => of({ status: 200, result: { id: 1, role: {}, status: {}, address: {} } }),
      checkUsernameAvailability: () => of({ status: 200, result: { available: true } }),
      updateUser: () => of({ status: 200, result: {} }),
      updateProfilePhoto: () => of({ status: 200, result: {} }),
      deleteProfilePhoto: () => of({ status: 200, result: {} }),
      getUserById: () => of({ status: 200, result: { id: 1, role: {}, status: {}, address: {} } }),
      getUserInsight: () => of({ status: 200, result: '' })
    };
    const mockSystemCodeService = {
      getSystemCodes: () => []
    };

    await TestBed.configureTestingModule({
      imports: [
        UserDetails, 
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
          translocoConfig: { defaultLang: 'en', availableLangs: ['en'] }
        })
      ],
      providers: [
        provideRouter([]),
        { 
          provide: ActivatedRoute, 
          useValue: { 
            snapshot: { paramMap: { get: () => '1' } },
            parent: {} 
          } 
        },
        MessageService,
        ConfirmationService,
        DatePipe,
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: SystemCodeService, useValue: mockSystemCodeService },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
