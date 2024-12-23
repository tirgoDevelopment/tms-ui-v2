import { Component } from '@angular/core';
import { NzModules } from 'src/app/shared/modules/nz-modules.module';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModules } from 'src/app/shared/modules/common.module';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss'],
  imports: [NzModules,NzCollapseModule,TranslateModule,CommonModules ],
  standalone: true
})
export class SupportComponent {
  panels: any [] = [
    {name: 'Self aware panel', content: "I'm visible because I am open"},
    {name: 'Self aware panel', content: "I'm visible because I am open"},
  ]
}
