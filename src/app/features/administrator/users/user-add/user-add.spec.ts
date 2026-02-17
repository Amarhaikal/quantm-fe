import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAdd } from './user-add';

describe('UserAdd', () => {
  let component: UserAdd;
  let fixture: ComponentFixture<UserAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserAdd]
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
