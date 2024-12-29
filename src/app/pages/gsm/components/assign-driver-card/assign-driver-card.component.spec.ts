import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignDriverCardComponent } from './assign-driver-card.component';

describe('AssignDriverCardComponent', () => {
  let component: AssignDriverCardComponent;
  let fixture: ComponentFixture<AssignDriverCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssignDriverCardComponent]
    });
    fixture = TestBed.createComponent(AssignDriverCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
