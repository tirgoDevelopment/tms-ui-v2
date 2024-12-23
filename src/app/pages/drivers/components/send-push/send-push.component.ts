import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModules } from 'src/app/shared/modules/common.module';
import { NzModules } from 'src/app/shared/modules/nz-modules.module';

@Component({
  selector: 'app-send-push',
  templateUrl: './send-push.component.html',
  styleUrls: ['./send-push.component.scss'],
  standalone: true,
  imports: [CommonModules, NzModules, TranslateModule],
})
export class SendPushComponent implements OnInit {
  form: FormGroup;

  constructor() { }
  ngOnInit(): void {
    this.form = new FormGroup({
      text: new FormControl('' , [Validators.required]),
      type: new FormControl('' , [Validators.required]),
      message: new FormControl('' , [Validators.required])
    });
  }

}
