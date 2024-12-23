import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzModules } from 'src/app/shared/modules/nz-modules.module';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskDirective } from 'ngx-mask';
import { CodeInputModule } from 'angular-code-input';
import { NotificationService } from 'src/app/shared/services/notification.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
  standalone: true,
  imports: [CommonModule, NzModules, FormsModule, ReactiveFormsModule, RouterModule, TranslateModule, NgxMaskDirective, CodeInputModule]
})
export class SignUpComponent implements OnInit {
  loading: boolean = false;
  otpCode: string;
  timerOtp: string;
  countdown: number = 119;
  intervalId: any;
  isCodeExpired: boolean = false;
  codeEntered:boolean = false;
  verifyCode:string;

  passwordVisible = false;
  form: FormGroup;
  countries = [
    { code: 'UZ', name: 'Узбекистан', flag: 'assets/images/flags/UZ.svg' },
    { code: 'KZ', name: 'Казахстан', flag: 'assets/images/flags/KZ.svg' },
    { code: 'RU', name: 'Россия', flag: 'assets/images/flags/RU.svg' },
  ];
  selectedCountry: { code: string; name: string; flag: string } = this.countries[0];
  currentMask: string = '+000 (00) 000-00-00';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private toastr: NotificationService) { }

  ngOnInit(): void {
    this.buildForm();
  }
  buildForm(): void {
    this.form = this.formBuilder.group({
      phone: ['+998', [Validators.required]],
      countryCode: [this.selectedCountry.code],
    });
  }
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }
  onVerifyPhone() {
    this.form.disable();
    this.authService.verifyPhone(this.form.value).subscribe((res: any) => {
      if (res && res.success) {
        this.otpCode = res.data.code
        this.form.enable();
        this.startCountdown();
      } else {
        this.form.enable();
      }
    }, err => {
      this.form.enable();
    })
  }
  selectCountry(country: { code: string; name: string; flag: string }) {
    this.selectedCountry = country;
    this.form.get('countryCode')?.setValue(country.code);
    this.updateMask();
  }
  updateMask() {
    switch (this.selectedCountry.code) {
      case 'UZ':
        this.currentMask = '+000 00 000-00-00';
        break;
      case 'KZ':
        this.currentMask = '+0 000 000-00-00';
        break;
      case 'RU':
        this.currentMask = '+0 000 000-00-00';
        break;
      default:
        this.currentMask = '';
    }
    this.form.get('phone')?.updateValueAndValidity();
  }
  onCodeChanged(code: string) {
    code.length == 6 ? (this.codeEntered = true) : (this.codeEntered = false);
    this.verifyCode = code;
  }
  sendVerifyedCode() {
    this.loading = true;
    if (this.isCodeExpired) {
      this.loading = false;
      this.toastr.error('Срок действия SMS-кода истек. Пожалуйста, запросите новый.','');
    }
    else if (this.otpCode != this.verifyCode) {
      this.loading = false;
      this.toastr.error('Пароль не совпадает','');
    }
    else if (this.otpCode == this.verifyCode) {
      this.router.navigate(['auth/register'], { queryParams: { phone: this.form.value.phone } });
    }
  }

  startCountdown() {
    this.countdown = 119;
    this.intervalId = setInterval(() => {
      if (this.countdown >= 0) {
        this.formatTime(this.countdown);
        this.countdown--;
      } else {
        this.stopCountdown();
        this.isCodeExpired = true;
      }
    }, 1000);
  }
  stopCountdown() {
    clearInterval(this.intervalId);
  }
  formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    this.timerOtp = `${"0" + minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }
  retrySms() {
    this.loading = true;
    this.authService.verifyPhone(this.form.value).subscribe((res: any) => {
      if (res && res.success) {
        this.otpCode = res.data.code;
        this.loading = false;
        this.isCodeExpired = false;
        this.countdown = 119;
        this.startCountdown();
      }else {
        this.loading = false;
      }
    },err => {
      this.loading = false;
    });
  }

}
