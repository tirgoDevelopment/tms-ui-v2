import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgxMaskDirective } from 'ngx-mask';
import { of } from 'rxjs';
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
  form:FormGroup;
  loading: boolean = false;
  drivers$
  currentUser
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
  }
  findDriver(searchTerm: string) {
    console.log(this.currentUser);
    
    this.driverService.findDrivers(this.currentUser.merchantId , searchTerm, this.form.value.searchAs).subscribe((response:any) => {
      this.drivers$ = of(response.data.content);
    });
  }
  initForm() {
    this.form = new FormGroup({
      searchAs: new FormControl('driverId'),
      tmsId: new FormControl(this.currentUser.merchantId),
      driverId: new FormControl(null, Validators.required),
      amount: new FormControl(null, Validators.required),
    })
  }

  onSubmit() {
    this.loading = true;
    this.form.value.amount = this.form.value.amount.toString(); 
    this.gsmService.topUpTmsGSMBalance(this.form.value).subscribe((res:any) => {
      if(res && res.success) {
        this.loading = false;
        this.toastr.success(this.translate.instant('successfullUpdated'));
        this.drawerRef.close({success: true});
      }
    },err => {
      this.loading = false;
    })
  }
}
