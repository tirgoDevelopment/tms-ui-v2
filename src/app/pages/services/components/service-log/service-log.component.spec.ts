import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceLogComponent } from './service-log.component';

describe('ServiceLogComponent', () => {
  let component: ServiceLogComponent;
  let fixture: ComponentFixture<ServiceLogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ServiceLogComponent]
    });
    fixture = TestBed.createComponent(ServiceLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
