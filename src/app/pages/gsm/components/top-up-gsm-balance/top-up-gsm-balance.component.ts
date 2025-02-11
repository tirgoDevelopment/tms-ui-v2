import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgxMaskDirective } from 'ngx-mask';
import { map, of } from 'rxjs';
import { CommonModules } from 'src/app/shared/modules/common.module';
import { NzModules } from 'src/app/shared/modules/nz-modules.module';
import { PipeModule } from 'src/app/shared/pipes/pipes.module';
import { GSMService } from '../../services/gsm.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { DriversService } from 'src/app/pages/drivers/services/drivers.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-top-up-gsm-balance',
  templateUrl: './top-up-gsm-balance.component.html',
  styleUrls: ['./top-up-gsm-balance.component.scss'],
  standalone: true,
  imports: [NzModules, TranslateModule, CommonModules, PipeModule, NgxMaskDirective],

})
export class TopUpGsmBalanceComponent implements OnInit {
  form: FormGroup;
  loading: boolean = false;
  drivers$
  currentUser
  selectedDriver
  constructor(
    private gsmService: GSMService,
    private toastr: NotificationService,
    private drawerRef: NzDrawerRef,
    private translate: TranslateService,
    private driverService: DriversService
  ) { }
  ngOnInit(): void {
    this.currentUser = jwtDecode(localStorage.getItem('accessTokenTms') || '');
    this.initForm();
    this.listenToDriverChange();
  }
  findDriver(searchTerm: string) {
    if (searchTerm) {
      this.driverService.findDrivers(this.currentUser.merchantId, searchTerm, this.form.value.searchAs).subscribe((response: any) => {
        if (response && response.data) {
          this.drivers$ = of(response.data.content);
        } else {
          this.drivers$ = of([]);
        }
      });
    }

  }
  initForm() {
    this.form = new FormGroup({
      searchAs: new FormControl('driverId'),
      tmsId: new FormControl(this.currentUser.tmsId),
      driverId: new FormControl(null, Validators.required),
      amount: new FormControl(null, Validators.required),
      gsmCardNumber: new FormControl(null, Validators.required)
    })
  }
  listenToDriverChange() {
    this.form.get('driverId')?.valueChanges.subscribe((driverId) => {
      if (driverId) {
        const selectedDriver = this.drivers$.pipe(
          map((drivers: any) => drivers.find((driver: any) => driver.id === driverId))
        );
        selectedDriver.subscribe((driver: any) => {
          if (driver) {
            this.form.get('gsmCardNumber')?.setValue(driver.gsmCardNumber || '');
          }
        });
      } else {
        this.form.get('gsmCardNumber')?.setValue('');
      }
    });
  }
  onSubmit() {
    this.loading = true;
    this.form.value.amount = this.form.value.amount.toString();
    this.gsmService.topUpTmsGSMBalance(this.form.value).subscribe((res: any) => {
      if (res && res.success) {
        this.loading = false;
        this.toastr.success(this.translate.instant('successfullUpdated'));
        this.drawerRef.close({ success: true });
      }
    }, err => {
      this.loading = false;
    })
  }
}
