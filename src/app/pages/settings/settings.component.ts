import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModules } from 'src/app/shared/modules/common.module';
import { NzModules } from 'src/app/shared/modules/nz-modules.module';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { SettingService } from './services/settings.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  imports: [NzModules, CommonModules, TranslateModule],
  standalone: true
})
export class SettingsComponent implements OnInit {
  loading: boolean = false;
  currentUser: any;
  form: FormGroup = new FormGroup({
    userId: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required]),
    confirmPassword: new FormControl('', [Validators.required])
  });

  constructor(
    private toastr: NotificationService,
    private settingSevice: SettingService
  ) { }
  ngOnInit(): void {
    this.currentUser = jwtDecode(localStorage.getItem('accessTokenTms'));
    this.form.patchValue({
      userId: this.currentUser.sub
    })
  }

  onSubmit() {
    this.loading = true;
    if (this.form.value.newPassword !== this.form.value.confirmPassword) {
      this.toastr.error('Пароль не совпадает');
      this.loading = false;
    }
    else if (this.form.value.password == null) {
      this.loading = false;
      this.toastr.error('Требуется старый пароль');
    }
    else if (this.form.value.newPassword == null) {
      this.loading = false;
      this.toastr.error('Требуется новый пароль');
    }
    else if (this.form.value.confirmPassword == null) {
      this.loading = false;
      this.toastr.error('Подтвердите пароль');
    }
    else {
      this.settingSevice.changePassword(this.form.value).subscribe((res: any) => {
        if (res && res.success) {
          this.loading = false;
          this.toastr.success('Пароль успешно обновлен');
        }
      }, err => {
        if (err.error.message == 'invalidPassword') {
          this.toastr.error('Неверный старый пароль ');
          this.loading = false;
        } else {
          this.toastr.error(err.error.message);
          this.loading = false;
        }
      })
      this.loading = false;
    }
  }

}
