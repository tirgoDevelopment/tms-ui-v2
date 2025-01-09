import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipeModule } from 'src/app/shared/pipes/pipes.module';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TranslateModule } from '@ngx-translate/core';
import { NzModules } from 'src/app/shared/modules/nz-modules.module';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  standalone: true,
  imports: [CommonModule, NzIconModule, PipeModule, TranslateModule, NzModules]
})
export class DetailComponent implements OnInit {
  @Input() item?: any;
  loadingPage = true;
  loading
  constructor() { }

  ngOnInit(): void {
    if(this.item) {
      this.loadingPage = false;
    }
  }
}
