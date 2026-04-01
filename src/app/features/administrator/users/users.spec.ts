import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Users } from './users';
import { UserService } from '../../../core/services/user.service';
import { SystemCodeService } from '../../../core/services/system-code.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { TranslocoTestingModule } from '@ngneat/transloco';

describe('Users', () => {
  let component: Users;
  let fixture: ComponentFixture<Users>;

  beforeEach(async () => {
    // PrimeNG uses ResizeObserver which JSDOM lacks.
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    const mockUserService = {
      getUsers: () => of({ result: { data: [], total_count: 0 } })
    };

    const mockSystemCodeService = {
      getSystemCodes: () => []
    };

    await TestBed.configureTestingModule({
      imports: [
        Users, 
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
          translocoConfig: { defaultLang: 'en', availableLangs: ['en'] }
        })
      ],
      providers: [
        provideRouter([]),
        MessageService,
        ConfirmationService,
        { provide: UserService, useValue: mockUserService },
        { provide: SystemCodeService, useValue: mockSystemCodeService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Users);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
