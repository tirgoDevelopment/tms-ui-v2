import { Component, Input, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModules } from 'src/app/shared/modules/common.module';
import { NzModules } from 'src/app/shared/modules/nz-modules.module';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { NgxMaskDirective } from 'ngx-mask';
import { CurrenciesService } from 'src/app/shared/services/references/currencies.service';
import { NzDrawerRef, } from 'ng-zorro-antd/drawer';
import { DriversService } from '../../services/drivers.service';
import { catchError, debounceTime, distinctUntilChanged, Observable, of, Subject, switchMap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { generateQueryFilter } from 'src/app/shared/pipes/queryFIlter';

@Component({
  selector: 'app-topup-balance-driver',
  templateUrl: './topup-balance-driver.component.html',
  styleUrls: ['./topup-balance-driver.component.scss'],
  standalone: true,
  imports: [CommonModules, NzModules, TranslateModule, NgxMaskDirective]

})
export class TopupBalanceDriverComponent {
  @Input() merchantId: string;
  form: FormGroup;
  currencies: any[] = [];
  loading: boolean = false;
  drivers$!: Observable<any>;
  searchDriver$ = new Subject<string>();
  selectedDriver: any;
  currentUser: any;
  constructor(
    private toastr: NotificationService,
    private driverApi: DriversService,
    private currenciesService: CurrenciesService,
    private drawer: NzDrawerRef,
    private translate: TranslateService
  ) { }
  ngOnInit(): void {
    this.initializeForm();
    this.currentUser = jwtDecode(localStorage.getItem('accessTokenTms'));

    this.getDrivers();
  }
  getDrivers() {
    this.drivers$ = this.searchDriver$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((searchTerm: string) => this.driverApi.getAll(this.currentUser.merchantId, { driverId: searchTerm }).pipe(
        catchError((err) => {
          return of({ data: { content: [] } });
        })
      )),
    );
  }
  initializeForm(): void {
    this.form = new FormGroup({
      driverId: new FormControl(null, [Validators.required]),
      tirAmount: new FormControl(null, [Validators.required]),
      balanceType: new FormControl(null, [Validators.required]),
    });
  }
  submit() {
    this.loading = true;
    this.form.value.tirAmount = this.form.value.tirAmount.toString();
    this.driverApi.topupDriverBalance(this.form.value).subscribe((res) => {
      this.loading = false;
      if (res && res.success) {
        this.toastr.success(this.translate.instant('successfullCreated'));
        this.drawer.close({ success: true });
      }
    }, err => {
      this.loading = false;
    });
  }
  findDriver(ev: string) {
    this.searchDriver$.next(ev);
  }
}
