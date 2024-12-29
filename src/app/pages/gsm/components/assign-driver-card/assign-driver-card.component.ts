import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { DriversService } from 'src/app/pages/drivers/services/drivers.service';
import { CommonModules } from 'src/app/shared/modules/common.module';
import { NzModules } from 'src/app/shared/modules/nz-modules.module';
import { PipeModule } from 'src/app/shared/pipes/pipes.module';
import { GSMService } from '../../services/gsm.service';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { NotificationService } from 'src/app/shared/services/notification.service';

@Component({
  selector: 'app-assign-driver-card',
  templateUrl: './assign-driver-card.component.html',
  styleUrls: ['./assign-driver-card.component.scss'],
  standalone: true,
  imports: [NzModules, TranslateModule, CommonModules, PipeModule],
})

export class AssignDriverCardComponent implements OnInit {
  form: FormGroup;
  drivers$
  loading: boolean = false;

  constructor(
    private driverService: DriversService,
    private gsmService: GSMService,
    private drawerRef: NzDrawerRef,
    private toastr: NotificationService,
    private translate: TranslateService
  ) {}
  ngOnInit(): void {
    this.initForm();
  }

  findDriver(searchTerm: string) {
    // this.driverService.findDrivers(searchTerm, this.form.value.searchAs).subscribe((response:any) => {
    //   this.drivers$ = of(response.data.content);
    // });
  }
  initForm() {
    this.form = new FormGroup({
      id: new FormControl(null, [Validators.required]),
      searchAs: new FormControl('driverId'),
      gsmCardNumber: new FormControl(null, [Validators.required])
    })
  }
  onSubmit() {
   this.loading = true;
    this.gsmService.postGSMCardNumber(this.form.value).subscribe((res:any) => {
      if(res && res.success) {
        this.loading = false;
        this.drawerRef.close({success:true});
        this.toastr.success(this.translate.instant('successfullUpdated'));
      }
    },err => {
      this.loading = false;
    })
  }
}
