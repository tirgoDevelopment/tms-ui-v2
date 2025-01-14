import { Component, OnInit } from '@angular/core';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { DriverFormComponent } from './components/driver-form/driver-form.component';
import { DriverModel } from './models/driver.model';
import { generateQueryFilter } from 'src/app/shared/pipes/queryFIlter';
import { catchError, of, tap } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { DriversService } from './services/drivers.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModules } from 'src/app/shared/modules/common.module';
import { IconsProviderModule } from 'src/app/shared/modules/icons-provider.module';
import { NzModules } from 'src/app/shared/modules/nz-modules.module';
import { PipeModule } from 'src/app/shared/pipes/pipes.module';
import { AddTransportComponent } from './components/add-transport/add-transport.component';
import { SendPushComponent } from './components/send-push/send-push.component';
import { AssignTmcComponent } from './components/assign-tmc/assign-tmc.component';
import { jwtDecode } from 'jwt-decode';
import { TopupBalanceDriverComponent } from './components/topup-balance-driver/topup-balance-driver.component';

@Component({
  selector: 'app-drivers',
  templateUrl: './drivers.component.html',
  styleUrls: ['./drivers.component.scss'],
  standalone: true,
  imports: [CommonModules, NzModules, TranslateModule, IconsProviderModule, PipeModule],
  providers: [NzModalService],
  animations: [
    trigger('showHideFilter', [
      state('show', style({ height: '*', opacity: 1, visibility: 'visible' })),
      state('hide', style({ height: '0', opacity: 0, visibility: 'hidden' })),
      transition('show <=> hide', animate('300ms ease-in-out'))
    ])
  ]
})
export class DriversComponent implements OnInit {
  currentUser:any;
  confirmModal?: NzModalRef;
  data: DriverModel[] = [];
  loader: boolean = false;
  isFilterVisible: boolean = false;
  filter: Record<string, string> = this.initializeFilter();
  pageParams = {
    pageIndex: 0,
    pageSize: 10,
    totalPagesCount: 1,
    sortBy: '',
    sortType: '',
  };

  constructor(
    private toastr: NotificationService,
    private modal: NzModalService,
    private driversService: DriversService,
    private drawer: NzDrawerService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.currentUser = jwtDecode(localStorage.getItem('accessTokenTms'));
  }

  getAll(): void {
    this.loader = true;
    const queryString = generateQueryFilter(this.filter);
    this.driversService.getAll(this.currentUser.merchantId,this.pageParams, queryString).pipe(
      tap((res: any) => {
        this.data = res?.success ? res.data.content : [];
        this.pageParams.totalPagesCount = res.data.pageSize * res?.data?.totalPagesCount;
      }),
      catchError(() => {
        this.data = [];
        return of(null);
      }),
      tap(() => (this.loader = false))
    ).subscribe();
  }
  handleDrawer(action: 'add' | 'edit' | 'view', id?:number|string): void {
    const drawerRef: any = this.drawer.create({
      nzTitle: this.translate.instant(
        action === 'add' ? 'add' :
          action === 'edit' ? 'edit' :
            'information'
      ),
      nzContent: DriverFormComponent,
      nzPlacement: 'right',
      nzWidth: '400px',
      nzContentParams: {
        id: id,
        mode: action
      }
    });
    drawerRef.afterClose.subscribe((res: any) => {
      if (res && res?.success && res?.mode !== 'add') {
        this.getAll();
        drawerRef.componentInstance?.form.reset();
      }
      if (res && res.success && res?.mode === 'add') {
        this.confirmModal = this.modal.confirm({
          nzTitle: this.translate.instant('Вы хотите добавить транспорт ?'),
          nzOkText: this.translate.instant('yes'),
          nzCancelText: this.translate.instant('cancel'),
          nzOnOk: () => {
            const addTransportDrawerRef: any = this.drawer.create({
              nzTitle: this.translate.instant('add_transport'),
              nzContent: AddTransportComponent,
              nzPlacement: 'right',
              nzContentParams: {
                mode: 'add',
                driverId: res.driverId
              }
            });
            this.confirmModal.close();
            addTransportDrawerRef.afterClose.subscribe(() => {
              this.getAll();
            });
          }
        })
      }
    });
  }
  topupBalance(){
    const drawerRef: any = this.drawer.create({
      nzTitle: this.translate.instant('top_up_balance'),
      nzContent: TopupBalanceDriverComponent,
      nzPlacement: 'right'
    })
    drawerRef.afterClose.subscribe((res: any) => {
      if (res && res?.success) {
        this.getAll();
      }
    });
  }
  remove(id: number | string): void {
    this.confirmModal = this.modal.confirm({
      nzTitle: this.translate.instant('are_you_sure'),
      nzOkText: this.translate.instant('remove'),
      nzCancelText: this.translate.instant('cancel'),
      nzOkDanger: true,
      nzOnOk: () => {
        this.driversService.unAssignDriver(id).subscribe((res: any) => {
          if (res?.success) {
            this.toastr.success(this.translate.instant('successfullDeleted'), '');
            this.getAll();
          }
        });
      }
    });
  }

  onPageIndexChange(pageIndex: number): void {
    this.pageParams.pageIndex = pageIndex;
    this.getAll();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageParams.pageSize = pageSize;
    this.pageParams.pageIndex = 0;
    this.getAll();
  }

  toggleFilter(): void {
    this.isFilterVisible = !this.isFilterVisible;
  }

  resetFilter(): void {
    this.filter = this.initializeFilter();
    this.getAll();
  }

  private initializeFilter(): Record<string, string> {
    return { driverId: '', transportNumber: '', subscriptionStatus: '', isOwnOrder: '', isOwnBalance: '' };
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

  sendNotification() {
    this.drawer.create({
      nzTitle: this.translate.instant('send_push'),
      nzContent: SendPushComponent,
      nzPlacement: 'right'
    })
  }
  assignTmc(item: DriverModel) {
    this.drawer.create({
      nzTitle: this.translate.instant('assign_driver'),
      nzContent: AssignTmcComponent,
      nzPlacement: 'right',
      nzContentParams: {
        data: item
      }
    })
  }
  addTransport(item: DriverModel) {
    this.drawer.create({
      nzTitle: this.translate.instant('add_transport'),
      nzContent: AddTransportComponent,
      nzPlacement: 'right',
      nzContentParams: {
        mode: 'add',
        driverId: item.id
      }
    })
  }
}