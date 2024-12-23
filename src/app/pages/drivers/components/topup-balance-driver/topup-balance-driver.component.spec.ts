import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopupBalanceDriverComponent } from './topup-balance-driver.component';

describe('TopupBalanceDriverComponent', () => {
  let component: TopupBalanceDriverComponent;
  let fixture: ComponentFixture<TopupBalanceDriverComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TopupBalanceDriverComponent]
    });
    fixture = TestBed.createComponent(TopupBalanceDriverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
