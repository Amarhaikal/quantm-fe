import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserAdd } from './user-add';
import { SystemCodeService } from '../../../../core/services/system-code.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { TranslocoTestingModule } from '@ngneat/transloco';

describe('UserAdd', () => {
  let component: UserAdd;
  let fixture: ComponentFixture<UserAdd>;

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
    const mockSystemCodeService = {
      getSystemCodes: () => []
    };

    await TestBed.configureTestingModule({
      imports: [
        UserAdd, 
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
          translocoConfig: { defaultLang: 'en', availableLangs: ['en'] }
        })
      ],
      providers: [
        provideRouter([]),
        MessageService,
        ConfirmationService,
        { provide: AuthService, useValue: mockAuthService },
        { provide: SystemCodeService, useValue: mockSystemCodeService },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
