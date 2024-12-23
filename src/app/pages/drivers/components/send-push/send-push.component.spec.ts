import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendPushComponent } from './send-push.component';

describe('SendPushComponent', () => {
  let component: SendPushComponent;
  let fixture: ComponentFixture<SendPushComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SendPushComponent]
    });
    fixture = TestBed.createComponent(SendPushComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
