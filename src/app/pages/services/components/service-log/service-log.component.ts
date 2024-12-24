import { Component, Input, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModules } from 'src/app/shared/modules/common.module';
import { NzModules } from 'src/app/shared/modules/nz-modules.module';
import { PipeModule } from 'src/app/shared/pipes/pipes.module';
import { ServicesService } from '../../services/services.service';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-service-log',
  templateUrl: './service-log.component.html',
  styleUrls: ['./service-log.component.scss'],
  standalone: true,
  imports: [NzModules, TranslateModule, CommonModules, PipeModule, RouterModule],
})
export class ServiceLogComponent implements OnInit{
  @Input() serviceId:number | string;
  data
  loading = false;
  constructor(
    private serviceService: ServicesService,
    private route: ActivatedRoute
  ) {
    this.serviceId = this.route.snapshot.params['id'];
  }
  ngOnInit(): void {
    
    this.getService();
  }
  cancelService() {
    this.loading = true;
    this.serviceService.patchServiceStatus({id:this.serviceId,status:'cancel'}).subscribe((res:any) => {
      if(res && res.success) {
        this.getService();
        this.loading = false;
      }
    },err => {
      this.loading = false;
    });
  }
  getService() {
    this.loading = true;
    this.serviceService.getServiceRequestById(this.serviceId).subscribe((res:any) => {
      if(res && res.success) {
        this.data = res.data.data;
        this.loading = false;
      }
    });
  }
}
