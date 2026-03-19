import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Sidemenu } from './sidemenu';
import { MenuService } from '../../../core/services/menu.service';
import { AuthService } from '../../../core/auth/auth.service';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { TranslocoTestingModule } from '@ngneat/transloco';

describe('Sidemenu', () => {
  let component: Sidemenu;
  let fixture: ComponentFixture<Sidemenu>;

  beforeEach(async () => {
    // 1. Mock window.matchMedia for JSDOM
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {}, // Deprecated
        removeListener: () => {}, // Deprecated
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });

    // 2. Mock external services
    const mockMenuService = {
      getMenu: () => of({ status: 200, result: [] }),
      isSidebarVisible: signal(true),
      isDesktop: signal(true),
    };

    const mockAuthService = {
      profileImageUrl: signal(''),
    };

    await TestBed.configureTestingModule({
      imports: [Sidemenu, TranslocoTestingModule.forRoot({})],
      providers: [
        provideRouter([]),
        { provide: MenuService, useValue: mockMenuService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Sidemenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
