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
import { BehaviorSubject, Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { generateQueryFilter } from 'src/app/shared/pipes/queryFIlter';
import { AssignDriverCardComponent } from './components/assign-driver-card/assign-driver-card.component';
import { TopUpGsmBalanceComponent } from './components/top-up-gsm-balance/top-up-gsm-balance.component';
import { GSMService } from './services/gsm.service';
import { DriversService } from '../drivers/services/drivers.service';
import { ServicesService } from '../services/services/services.service';

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
  loaderBalance = false;
  sseSubscription
  constructor(
    private gsmService: GSMService,
    private tmsService: ServicesService,
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

    this.sseSubscription = this.socketService.listen('tmsBalanceTopup').subscribe((event) => {
      this.getGsmBalance();
      const index = this.data.findIndex(item => item.id === event.data.id);
      if (index !== -1) {
        this.data[index] = event.data;
      }
    });
  }
  find(ev: string) {
    let filter = generateQueryFilter({ companyName: ev });
    this.searchTms$.next(filter);
  }
  getAll() {
    // this.filter['tmsId'] = this.currentUser.tmsId;
    const params = {
      ...this.filter,
      pageIndex: this.pageParams.pageIndex,
      pageSize: this.pageParams.pageSize
    };
    this.loader = true;
    this.gsmService.getTmsGSMTransactions(generateQueryFilter(params)).subscribe((res: any) => {
      if (res && res.success) {
        this.loader = false;
        this.data = res.data?.content || [];
        this.pageParams.totalPagesCount = res.data.totalPagesCount;
        this.totalItemsCount = this.pageParams.pageSize * this.pageParams.totalPagesCount;
      }
    }, err => {
      this.loader = false;
    })
  }
  getGsmBalance() {
    this.loaderBalance = true
    this.tmsService.tmsBalance(this.currentUser.tmsId).subscribe((res: any) => {
      if (res && res.success) {
        this.loaderBalance = false;
        this.gsmBalance = res.data.gsmBalance;
      }
    }, err => {
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
    drawerRef.afterClose.subscribe((res: any) => {
      if (res) {
        this.getAll();
      }
    })
  }
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
      tmsId: '',
      transactionType: 'request',
      statusId: '',
      createdAtFrom: '',
      createdAtTo: '',
    };
  }
  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageIndex, pageSize, sort } = params;
    this.pageParams.pageIndex = pageIndex;
    this.pageParams.pageSize = pageSize;

    const currentSort = sort.find(item => item.value !== null);
    this.pageParams.sortBy = currentSort?.key || null;
    this.pageParams.sortType = currentSort?.value === 'ascend' ? 'asc' : currentSort?.value === 'descend' ? 'desc' : '';

    this.getAll();
  }
  onTabChange(index: number): void {
    this.filter['transactionType'] = index === 0 ? 'request' : 'topup';
    this.getAll();
  }

}
