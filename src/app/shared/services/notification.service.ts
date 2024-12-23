import { Injectable } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private notification: NzNotificationService,
  ) { }

  success(title: string, content?: string): void {
    this.notification.success(title, content, {
      nzDuration: 3000,
      nzAnimate: true,
      nzPauseOnHover: true,
      nzStyle: { background: '#F6FFED', fontWeight: 'bold' }
    });
  }

  error(title: string, content?: string): void {
    this.notification.error(title, content, {
      nzDuration: 3000,
      nzAnimate: true,
      nzPauseOnHover: true,
      nzStyle: { background: '#FFF2F0', fontWeight: 'bold' }
    });
  }

  warning(title: string, content?: string): void {
    this.notification.warning(title, content, {
      nzDuration: 3000,
      nzAnimate: true,
      nzPauseOnHover: true,
      nzStyle: { background: '#FFFBE6', fontWeight: 'bold' }
    });
  }
}
