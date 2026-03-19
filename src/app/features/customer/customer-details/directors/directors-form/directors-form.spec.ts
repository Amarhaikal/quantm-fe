import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectorForm } from './directors-form';

describe('DirectorsForm', () => {
  let component: DirectorForm;
  let fixture: ComponentFixture<DirectorForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectorForm],
    }).compileComponents();

    fixture = TestBed.createComponent(DirectorForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
