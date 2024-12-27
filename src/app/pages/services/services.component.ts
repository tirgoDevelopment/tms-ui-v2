import { Component, OnInit, OnDestroy, ViewChild, QueryList, ViewChildren, ChangeDetectorRef, Inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModules } from 'src/app/shared/modules/common.module';
import { IconsProviderModule } from 'src/app/shared/modules/icons-provider.module';
import { NzModules } from 'src/app/shared/modules/nz-modules.module';
import { PipeModule } from 'src/app/shared/pipes/pipes.module';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import {
  trigger,
  style,
  transition,
  animate,
  state,
} from '@angular/animations';
import { ServicesService } from './services/services.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { ServiceFormComponent } from './components/service-form/service-form.component';
import { catchError, Observable, tap, throwError, Subscription } from 'rxjs';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { generateQueryFilter } from 'src/app/shared/pipes/queryFIlter';
import { SocketService } from 'src/app/shared/services/socket.service';
import { NzPopconfirmDirective } from 'ng-zorro-antd/popconfirm';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { ChatComponent } from 'src/app/shared/components/chat/chat.component';
import { DetailComponent } from './components/detail/detail.component';
export enum ServicesRequestsStatusesCodes {
  Waiting = 0,
  Priced = 1,
  Confirmed = 2,
  Working = 3,
  Active = 4,
  Completed = 5,
  Canceled = 6,
  Deleted = 7,
}

export enum SseEventNames {
  NewMessage = 'newMessage',
  NewServiceRequest = 'newServiceRequest',
  ServiceRequestCanceled = 'serviceRequestCanceled',
  ServiceRequestPriced = 'serviceRequestPriced',
  ServiceRequtConfirmed = 'serviceRequestConfirm',
  ServiceRequestToWorking = 'serviceRequestToWorking',
  ServiceRequestToCompleted = 'serviceRequestToCompleted',
  ServiceRequestDeleted = 'serviceRequestDeleted'
}


@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
  standalone: true,
  imports: [
    CommonModules,
    NzModules,
    TranslateModule,
    IconsProviderModule,
    PipeModule,
    ChatComponent
  ],
  providers: [NzModalService],
  animations: [
    trigger('showHideFilter', [
      state('show', style({ height: '*', opacity: 1, visibility: 'visible' })),
      state('hide', style({ height: '0', opacity: 0, visibility: 'hidden' })),
      transition('show <=> hide', animate('300ms ease-in-out')),
    ]),
  ],
})
export class ServicesComponent implements OnInit, OnDestroy {

  showChat: boolean = false;
  selectedServiceId: string | null = null;


  currentUser:any;
  tirBalance:number = 0;
  serviceBalance:number = 0;
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
  private sseSubscription: Subscription | null = null;
  constructor(
    private servicesService: ServicesService,
    private modal: NzModalService,
    private drawer: NzDrawerService,
    private translate: TranslateService,
    private toastr: NotificationService,
    private socketService: SocketService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) { }
  ngOnInit(): void {
    this.currentUser = jwtDecode(localStorage.getItem('accessTokenTms') || '');
    this.getStatuses();
    this.getRefServices();
    this.sseSubscription = this.socketService.getSSEEvents().subscribe((event) => {
      this.handleSocketEvent(event);
    });
    this.getBalance();
  }
  handleSocketEvent(event: any): void {
    const service = this.data.find(i => i.id == event.data.requestId);
    if (!service) return;

    let status;
    switch (event.event) {
      case SseEventNames.ServiceRequestPriced:
        status = this.statuses.find(i => i.code === 1);
        break;
      case SseEventNames.ServiceRequtConfirmed:
        status = this.statuses.find(i => i.code === 2);
        break;
      case SseEventNames.ServiceRequestToWorking:
        status = this.statuses.find(i => i.code === 3);
        break;
      case SseEventNames.ServiceRequestToCompleted:
        status = this.statuses.find(i => i.code === 5);
        break;
      case SseEventNames.ServiceRequestCanceled:
        status = this.statuses.find(i => i.code === 6);
        break;
      case SseEventNames.ServiceRequestDeleted:
        status = this.statuses.find(i => i.code === 7);
        break;
      default:
        return;
    }
    if (status) {
      service.status = status;
      this.cdr.detectChanges();
    }
  }
  showLog(id: string | number) {
    this.router.navigate(['/services', id, 'log']);
  }
  getBalance() {
    this.servicesService.tmsBalance(this.currentUser.merchantId).subscribe((res: any) => {
      if (res && res.success) {
        this.tirBalance = res.data.tirgoBalance;
        this.serviceBalance = res.data.serviceBalance;
      }
    })
  }
  ngAfterViewInit(): void {
  }
  ngOnDestroy() {
    if (this.sseSubscription) {
      this.sseSubscription.unsubscribe();
    }
    // this.socketService.disconnectSSE();
  }
  public getAll(): void {
    this.loader = true;
    const params = {
      pageIndex: this.pageParams.pageIndex,
      pageSize: this.pageParams.pageSize,
      sortBy: this.pageParams.sortBy,
      sortType: this.pageParams.sortType,
      ...this.filter,
    };
    let query = generateQueryFilter(params)
    this.servicesService
      .getDriverServices(query)
      .pipe(
        tap((res: any) => {
          if (res && res?.success) {
            this.data = res.data.content;
            this.pageParams.totalPagesCount = res.data.totalPagesCount;
            this.totalItemsCount = this.pageParams.pageSize * this.pageParams.totalPagesCount;
          }
          else {
            this.data = [];
            this.loader = false;
          }
        }),
        catchError(this.handleError.bind(this)),
        tap(() => (this.loader = false))
      )
      .subscribe();
  }
  private handleError(): Observable<never> {
    this.data = [];
    return throwError(new Error('Error fetching orders'));
  }
  showDetails(item: any) {
    const drawerRef: any = this.drawer.create({
      nzTitle: this.translate.instant('information'),
      nzContent: DetailComponent,
      nzPlacement: 'right',
      nzContentParams: { item },
    });
  }
  showChatForService(id) {
    this.selectedServiceId = id;
    this.showChat = true;
    
  }
  onChatClose() {
    this.showChat = false;
    this.selectedServiceId = null;
  }
  addService() {
    const drawerRef: any = this.drawer.create({
      nzTitle: this.translate.instant('add'),
      nzContent: ServiceFormComponent,
      nzPlacement: 'right',
    });
    drawerRef.afterClose.subscribe((result: any) => {
      if (result && result.success) {
        this.getAll();
        drawerRef.componentInstance?.form.reset();
      }
    });
  }
  getStatuses() {
    this.servicesService.getServiceStatus().subscribe((res: any) => {
      this.statuses = res.data;
    });
  }
  getRefServices() {
    this.servicesService.getServiceList().subscribe((res: any) => {
      this.services = res.data;
    });
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
  public toggleFilter(): void {
    this.isFilterVisible = !this.isFilterVisible;
  }
  public resetFilter(): void {
    this.filter = this.initializeFilter();
    this.getAll();
  }
  private initializeFilter(): Record<string, string> {
    return {
      serviceId: '',
      driverId: '',
      statusId: '',
      createdAtFrom: '',
      createdAtTo: '',
    };
  }
  calculateSum(amountDetails: any[]): number {
    if (!Array.isArray(amountDetails)) return 0;
    return amountDetails.reduce(
      (sum, detail) => sum + parseFloat(detail.amount || 0),
      0
    );
  }
  getServicePriceMessage(serviceName: string, totalPrice: number): string {
    return this.translate.instant('services.servicePriceMessage', {
      serviceName,
      totalPrice,
    });
  }
  acceptService(item: any) {
    this.servicesService.patchServiceStatus({ id: item.id, status: 'confirm-price' }).subscribe((res: any) => {
      if (res && res.success) {
        this.getAll();
        this.toastr.success(this.translate.instant('successfullUpdated'), '');
      }
    });
  }
  cancelService(item: any) {
    this.modal.confirm({
      nzTitle: this.translate.instant('are_you_sure'),
      nzOkText: this.translate.instant('confirm'),
      nzCancelText: this.translate.instant('cancel'),
      nzOnOk: () => {
        this.servicesService.patchServiceStatus({ id: item.id, status: 'cancel' }).subscribe((res: any) => {
          if (res && res.success) {
            this.getAll();
            this.toastr.success(this.translate.instant('successfullyCanceled'), '');
          }
        });
      }
    });
  }
}
