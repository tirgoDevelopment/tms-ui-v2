import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GSMComponent } from './gsm.component';

describe('GSMComponent', () => {
  let component: GSMComponent;
  let fixture: ComponentFixture<GSMComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GSMComponent]
    });
    fixture = TestBed.createComponent(GSMComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
