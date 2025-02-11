import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransportsComponent } from './transports.component';

describe('TransportsComponent', () => {
  let component: TransportsComponent;
  let fixture: ComponentFixture<TransportsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TransportsComponent]
    });
    fixture = TestBed.createComponent(TransportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
