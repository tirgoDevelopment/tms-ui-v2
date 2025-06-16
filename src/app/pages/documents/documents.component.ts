import { Component, OnInit } from '@angular/core';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { DocumentModel } from './models/documents.model';
import { generateQueryFilter } from 'src/app/shared/pipes/queryFIlter';
import { catchError, of, tap } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { DocumentsService } from './services/documents.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModules } from 'src/app/shared/modules/common.module';
import { IconsProviderModule } from 'src/app/shared/modules/icons-provider.module';
import { NzModules } from 'src/app/shared/modules/nz-modules.module';
import { PipeModule } from 'src/app/shared/pipes/pipes.module';
import { AddTransportComponent } from '../transports/components/add-transport/add-transport.component';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
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
export class DocumentsComponent implements OnInit {
  currentUser:any;
  confirmModal?: NzModalRef;
  driversDocuments: DocumentModel[] = [];
  transportsDocuments: DocumentModel[] = [];
  loader: boolean = false;
  isFilterVisible: boolean = false;
  filter: Record<string, string> = this.initializeFilter();
  totalItemsCount: number = 0;
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
    private documentsService: DocumentsService,
    private drawer: NzDrawerService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.currentUser = jwtDecode(localStorage.getItem('accessTokenTms'));
  }

  getAll(): void {
    this.loader = true;
    const queryString = generateQueryFilter(this.filter);

    this.documentsService.getDriversDocuments(queryString).pipe(
      tap((res: any) => {
        this.driversDocuments = res?.success ? res.driversDocuments.content : [];
        this.pageParams.totalPagesCount = res.driversDocuments.pageSize * res?.driversDocuments?.totalPagesCount;
      }),
      catchError(() => {
        this.driversDocuments = [];
        return of(null);
      }),
      tap(() => (this.loader = false))
    ).subscribe();

    this.documentsService.getTransportsDocuments(queryString).pipe(
      tap((res: any) => {
        this.driversDocuments = res?.success ? res.driversDocuments.content : [];
        this.pageParams.totalPagesCount = res.driversDocuments.pageSize * res?.driversDocuments?.totalPagesCount;
      }),
      catchError(() => {
        this.driversDocuments = [];
        return of(null);
      }),
      tap(() => (this.loader = false))
    ).subscribe();

  }
  handleDrawer(action: 'add' | 'edit' | 'view', id?:number|string): void {
    // const drawerRef: any = this.drawer.create({
    //   nzTitle: this.translate.instant(
    //     action === 'add' ? 'add' :
    //       action === 'edit' ? 'edit' :
    //         'information'
    //   ),
    //   nzContent: DriverFormComponent,
    //   nzPlacement: 'right',
    //   nzWidth: '400px',
    //   nzContentParams: {
    //     id: id,
    //     mode: action
    //   }
    // });
    // drawerRef.afterClose.subscribe((res: any) => {
    //   if (res && res?.success && res?.mode !== 'add') {
    //     this.getAll();
    //     drawerRef.componentInstance?.form.reset();
    //   }
    //   if (res && res.success && res?.mode === 'add') {
    //     this.confirmModal = this.modal.confirm({
    //       nzTitle: this.translate.instant('Вы хотите добавить транспорт ?'),
    //       nzOkText: this.translate.instant('yes'),
    //       nzCancelText: this.translate.instant('cancel'),
    //       nzOnOk: () => {
    //         const addTransportDrawerRef: any = this.drawer.create({
    //           nzTitle: this.translate.instant('add_transport'),
    //           nzContent: AddTransportComponent,
    //           nzPlacement: 'right',
    //           nzContentParams: {
    //             mode: 'add',
    //             driverId: res.driverId
    //           }
    //         });
    //         this.confirmModal.close();
    //         addTransportDrawerRef.afterClose.subscribe(() => {
    //           this.getAll();
    //         });
    //       }
    //     })
    //   }
    // });
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

  onTabChange(event: any) {
    console.log(event)
  }

}