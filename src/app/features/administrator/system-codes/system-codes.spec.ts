import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SystemCodes } from './system-codes';
import { SystemCodeService } from '../../../core/services/system-code.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { TranslocoTestingModule } from '@ngneat/transloco';

describe('SystemCodes', () => {
  let component: SystemCodes;
  let fixture: ComponentFixture<SystemCodes>;

  beforeEach(async () => {
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    const mockSystemCodeService = {
      systemCodes: signal([]),
      getSystemCodesList: () => of({ result: { data: [], total_count: 0 } })
    };

    await TestBed.configureTestingModule({
      imports: [SystemCodes, TranslocoTestingModule.forRoot({
        langs: { en: {} },
        translocoConfig: { defaultLang: 'en', availableLangs: ['en'] }
      })],
      providers: [
        MessageService,
        ConfirmationService,
        { provide: SystemCodeService, useValue: mockSystemCodeService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SystemCodes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
