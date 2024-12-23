import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignTmcComponent } from './assign-tmc.component';

describe('AssignTmcComponent', () => {
  let component: AssignTmcComponent;
  let fixture: ComponentFixture<AssignTmcComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssignTmcComponent]
    });
    fixture = TestBed.createComponent(AssignTmcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
