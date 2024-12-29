import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopUpGsmBalanceComponent } from './top-up-gsm-balance.component';

describe('TopUpGsmBalanceComponent', () => {
  let component: TopUpGsmBalanceComponent;
  let fixture: ComponentFixture<TopUpGsmBalanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TopUpGsmBalanceComponent]
    });
    fixture = TestBed.createComponent(TopUpGsmBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
