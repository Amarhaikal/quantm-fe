import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionActivities } from './session-activities';

describe('SessionActivities', () => {
  let component: SessionActivities;
  let fixture: ComponentFixture<SessionActivities>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionActivities]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SessionActivities);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
