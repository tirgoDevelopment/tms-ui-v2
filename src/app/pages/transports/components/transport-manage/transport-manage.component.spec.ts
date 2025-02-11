import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransportManageComponent } from './transport-manage.component';

describe('TransportManageComponent', () => {
  let component: TransportManageComponent;
  let fixture: ComponentFixture<TransportManageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TransportManageComponent]
    });
    fixture = TestBed.createComponent(TransportManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
