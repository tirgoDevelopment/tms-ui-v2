import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModules } from 'src/app/shared/modules/common.module';
import { NzModules } from 'src/app/shared/modules/nz-modules.module';
import { TransportsService } from '../../services/transports.service';
import { BehaviorSubject, map, of, take } from 'rxjs';
import { DriversService } from 'src/app/pages/drivers/services/drivers.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { generateQueryFilter } from 'src/app/shared/pipes/queryFIlter';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-transport-manage',
  templateUrl: './transport-manage.component.html',
  styleUrls: ['./transport-manage.component.scss'],
  standalone: true,
  imports: [CommonModules, NzModules, TranslateModule]
})
export class TransportManageComponent implements OnInit {
  currentUser: any
  form
  type: string = 'assign' || 'unAssign';
  loading = false;
  transports$ = new BehaviorSubject<any[]>([]);
  drivers: any[] = [];
  drivers$;
  constructor(
    private transportService: TransportsService,
    private driverService: DriversService,
    private toastr: NotificationService,
    private translate: TranslateService,
    private drawerRef: NzDrawerRef
  ) { }
  ngOnInit(): void {
    this.currentUser = jwtDecode(localStorage.getItem('accessTokenTms'));
    this.form = new FormGroup({
      driverId: new FormControl(null),
      transportId: new FormControl(null, Validators.required),
    })
  }
  onTabChange(index) {
    index == 0 ? this.type = 'assign' : this.type = 'unAssign';
  }
  onSubmit() {
    this.loading = true;
    if (this.type == 'assign') {
      this.transportService.assignToDriver(this.form.value).subscribe(() => {
        this.drawerRef.close({ success: true });
        this.toastr.success(this.translate.instant('successfullUpdated'));
        this.loading = false;
      }, err => {
        this.loading = false;
      });
    } else {
      this.transportService.unassignToDriver(this.form.value).subscribe(() => {
        this.drawerRef.close({ success: true });
        this.toastr.success(this.translate.instant('successfullUpdated'));
        this.loading = false;
      }, err => {
        this.loading = false;
      });
    }
  }
  findTransport(searchTerm: string) {
    if (searchTerm) {
      this.transportService.findTransport(searchTerm).subscribe((response: any) => {
        this.transports$.next(response.data.content);
      });
    }
  }
  findDriver(searchTerm: string) {
    if (searchTerm) {
      this.driverService.findDrivers(this.currentUser.tmsId, searchTerm, 'driverId').subscribe((response: any) => {
        if (response && response.data) {
          this.drivers$ = of(response.data.content);
        } else {
          this.drivers$ = of([]);
        }
      });
    }
  }
  onDriverChange(driverId: any) {
    const selectedDriver = this.drivers.find(driver => driver.id == driverId);
    if (selectedDriver?.driverTransports?.length) {
      this.findTransport(selectedDriver.driverTransports[0].id);
      this.transports$.pipe(take(1)).subscribe(existingTransports => {
        const transportExists = existingTransports.some(t => t.id == selectedDriver.driverTransports[0].id);
        if (!transportExists) {
          const updatedTransports = [...existingTransports, selectedDriver.driverTransports[0]];
          this.transports$.next(updatedTransports);
        }
        this.form.patchValue({ transportId: selectedDriver.driverTransports[0].id });
      });
    } else {
      this.form.patchValue({ transportId: null });
    }
  }

}