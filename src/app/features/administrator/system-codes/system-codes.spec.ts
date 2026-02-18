import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemCodes } from './system-codes';

describe('SystemCodes', () => {
  let component: SystemCodes;
  let fixture: ComponentFixture<SystemCodes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemCodes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemCodes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
