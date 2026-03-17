import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectorsForm } from './directors-form';

describe('DirectorsForm', () => {
  let component: DirectorsForm;
  let fixture: ComponentFixture<DirectorsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectorsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirectorsForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
