import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DirectorForm } from './directors-form';
import { CustomerService } from '../../../../../core/services/customer.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { TranslocoTestingModule } from '@ngneat/transloco';

describe('DirectorsForm', () => {
  let component: DirectorForm;
  let fixture: ComponentFixture<DirectorForm>;

  beforeEach(async () => {
    // PrimeNG uses ResizeObserver which JSDOM lacks.
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    const mockCustomerService = {
      updateCustomerDirector: () => of({ status: 200, result: {} }),
      createCustomerDirector: () => of({ status: 201, result: {} })
    };

    await TestBed.configureTestingModule({
      imports: [
        DirectorForm,
        TranslocoTestingModule.forRoot({
          langs: { en: {} },
          translocoConfig: { defaultLang: 'en', availableLangs: ['en'] }
        })
      ],
      providers: [
        provideRouter([]),
        MessageService,
        ConfirmationService,
        { provide: CustomerService, useValue: mockCustomerService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DirectorForm);
    component = fixture.componentInstance;
    
    // IMPORTANT: Provide the conditionally required input BEFORE change detection kicks in.
    fixture.componentRef.setInput('customerId', 1);

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
