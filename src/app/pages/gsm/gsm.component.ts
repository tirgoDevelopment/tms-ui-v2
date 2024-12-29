import { trigger, state, style, transition, animate } from '@angular/animations';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CommonModules } from 'src/app/shared/modules/common.module';
import { IconsProviderModule } from 'src/app/shared/modules/icons-provider.module';
import { NzModules } from 'src/app/shared/modules/nz-modules.module';
import { PipeModule } from 'src/app/shared/pipes/pipes.module';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { SocketService } from 'src/app/shared/services/socket.service';
import { DriverFormComponent } from '../drivers/components/driver-form/driver-form.component';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { BehaviorSubject, catchError, debounceTime, distinctUntilChanged, Observable, of, switchMap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { generateQueryFilter } from 'src/app/shared/pipes/queryFIlter';
import { AssignDriverCardComponent } from './components/assign-driver-card/assign-driver-card.component';
import { TopUpGsmBalanceComponent } from './components/top-up-gsm-balance/top-up-gsm-balance.component';
import { GSMService } from './services/gsm.service';
import { DriversService } from '../drivers/services/drivers.service';

@Component({
  selector: 'app-gsm',
  templateUrl: './gsm.component.html',
  styleUrls: ['./gsm.component.scss'],
  standalone: true,
  imports: [CommonModules, NzModules, TranslateModule, IconsProviderModule, PipeModule,],
  providers: [NzModalService],
  animations: [
    trigger('showHideFilter', [
      state('show', style({ height: '*', opacity: 1, visibility: 'visible' })),
      state('hide', style({ height: '0', opacity: 0, visibility: 'hidden' })),
      transition('show <=> hide', animate('300ms ease-in-out')),
    ]),
  ],
})
export class GSMComponent implements OnInit {
  public data: any[] = [];
  public loader = false;
  public isFilterVisible = false;
  public filter: Record<string, string> = this.initializeFilter();
  statuses: any[] = [];
  services: any[] = [];
  pageParams = {
    pageIndex: 1,
    pageSize: 10,
    totalPagesCount: 1,
    sortBy: '',
    sortType: '',
  };
  totalItemsCount
  currentUser: any;
  searchTms$ = new BehaviorSubject<string>('');
  tms$: Observable<any>;
  gsmBalance = 0;
  loaderBalance=false;
  constructor(
    private gsmService: GSMService,
    private modal: NzModalService,
    private drawer: NzDrawerService,
    private translate: TranslateService,
    private socketService: SocketService,
    private toastr: NotificationService,
    private cdr: ChangeDetectorRef,
    private merchantApi: DriversService,
    private router: Router,
  ) { }
  ngOnInit(): void {
    this.currentUser = jwtDecode(localStorage.getItem('accessTokenTms') || '');
    this.getGsmBalance();
  }
  find(ev: string) {
    let filter = generateQueryFilter({ companyName: ev });
    this.searchTms$.next(filter);
  }
  getAll() {
    this.filter['tmsId'] = this.currentUser.merchantId;
    const params = {
      ...this.filter,
      pageIndex: this.pageParams.pageIndex,
      pageSize: this.pageParams.pageSize
    };
    this.loader = true;
      this.gsmService.getTmsGSMTransactions(generateQueryFilter(params)).subscribe((res:any) => {
        if(res && res.success) {
          this.loader =false;
          this.data = res.data.content;
        } 
      },err => {
        this.loader = false;
      })
  }
  getGsmBalance() {
    this.loaderBalance = true
    this.gsmService.getTmsGSMBalance(this.currentUser.merchantId).subscribe((res:any) => {
      if(res && res.success) {
        this.loaderBalance = false;
        this.gsmBalance = res.data.balance;
      }
    },err => {
      this.loaderBalance = false;
    })
  }
  assignDriverCard() {
    const drawerRef: any = this.drawer.create({
      nzTitle: this.translate.instant('gsm.assignCard'),
      nzContent: AssignDriverCardComponent,
      nzPlacement: 'right',
      nzWidth: '400px',
    });
  }
  topUpBalance() {
    const drawerRef: any = this.drawer.create({
      nzTitle: this.translate.instant('top_up_balance'),
      nzContent: TopUpGsmBalanceComponent,
      nzPlacement: 'right',
      nzWidth: '400px',
    });
  }
  changeStatus(item) { }
  showDriver(id) {
    const drawerRef: any = this.drawer.create({
      nzTitle: this.translate.instant('information'),
      nzContent: DriverFormComponent,
      nzMaskClosable: false,
      nzPlacement: 'right',
      nzWidth: '400px',
      nzContentParams: {
        id: id,
        mode: 'view'
      }
    });
  }
  public toggleFilter(): void {
    this.isFilterVisible = !this.isFilterVisible;
  }
  public resetFilter(): void {
    this.filter = this.initializeFilter();
    this.getAll();
  }
  private initializeFilter(): Record<string, string> {
    return {
      driverId: '',
      tmsId:'',
      transactionType: 'request',
      statusId: '',
      createdAtFrom: '',
      createdAtTo: '',
    };
  }
  public onQueryParamsChange(params: NzTableQueryParams): void {
    this.pageParams.pageIndex = params.pageIndex;
    this.pageParams.pageSize = params.pageSize;
    let { sort } = params;
    let currentSort = sort.find((item) => item.value !== null);
    let sortField = (currentSort && currentSort.key) || null;
    let sortOrder = (currentSort && currentSort.value) || null;
    sortOrder === 'ascend'
      ? (sortOrder = 'asc')
      : sortOrder === 'descend'
        ? (sortOrder = 'desc')
        : (sortOrder = '');
    this.pageParams.sortBy = sortField;
    this.pageParams.sortType = sortOrder;
    this.getAll();
  }
  onTabChange(index: number): void {
    this.filter['transactionType'] = index === 0 ? 'request' : 'topup';
    this.getAll();
  }
}
