import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SessionActivities } from './session-activities';
import { SessionActivityService } from '../../../core/services/session-activity.service';
import { SystemCodeService } from '../../../core/services/system-code.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { TranslocoTestingModule } from '@ngneat/transloco';

describe('SessionActivities', () => {
  let component: SessionActivities;
  let fixture: ComponentFixture<SessionActivities>;

  beforeEach(async () => {
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    const mockSessionActivityService = {
      getSessionActivities: () => of({ result: { data: [], total_count: 0 } })
    };
    const mockSystemCodeService = {
      systemCodes: signal([]),
      getSystemCodesList: () => of({ result: { data: [], total_count: 0 } })
    };

    await TestBed.configureTestingModule({
      imports: [SessionActivities, TranslocoTestingModule.forRoot({
        langs: { en: {} },
        translocoConfig: { defaultLang: 'en', availableLangs: ['en'] }
      })],
      providers: [
        MessageService,
        ConfirmationService,
        { provide: SessionActivityService, useValue: mockSessionActivityService },
        { provide: SystemCodeService, useValue: mockSystemCodeService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SessionActivities);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
