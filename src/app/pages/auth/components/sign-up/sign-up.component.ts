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
  debounceTimeout
  phoneCodeInvalid = false;

  passwordVisible = false;
  form: FormGroup;
  countries = [
    { code: '+998', name: 'Uzbekistan', flag: 'assets/images/flags/UZ.svg' },
    { code: '+7', name: 'Kazakhstan', flag: 'assets/images/flags/KZ.svg' },
    { code: '+7', name: 'Russia', flag: 'assets/images/flags/RU.svg' },
    { code: '+992', name: 'Tajikistan', flag: 'assets/images/flags/TJ.png' },
    { code: '+996', name: 'Kyrgyzstan', flag: 'assets/images/flags/KG.png' },
  ];
  selectedCountry: { code: string; name: string; flag: string } = this.countries[0];
  currentMask: string = '+000 00 000-00-00';

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
      number: ['', [Validators.required]],
      code: [this.selectedCountry.code],
      sendBy: "sms"
    });
  }
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }
  onVerifyPhone() {
    if (this.selectedCountry.code === '+998' || this.selectedCountry.code === '+992' || this.selectedCountry.code === '+996') {
      this.form.patchValue({
        code: this.form.value.number.substring(0, 3),
        number: this.form.value.number.substring(3),
      });
    }
    else if (this.selectedCountry.code === '+7') {
      this.form.patchValue({
        code: this.form.value.number.substring(0, 1),
        number: this.form.value.number.substring(1),
      });
    }    
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
  updateMask(code: string) {
    switch (code) {
      case '+998':
        this.currentMask = '+000 00 000-00-00';
        break;
      case '+7':
        this.currentMask = '+0 000 000-00-00';
        break;
      case '+7':
        this.currentMask = '+0 000 000-00-00';
        break;
      case '+992':
        this.currentMask = '+000 00 000-00-00';
        break;
      case '+996':
        this.currentMask = '+000 000 000-000';
        break;
      default:
        this.currentMask = '';
    }
    this.form.get('phoneNumbers')?.updateValueAndValidity();
  }
  selectCountry(country: { code: string; name: string; flag: string }) {
    this.selectedCountry = country;
    this.updateMask(country.code);
    this.form.patchValue({
      phoneNumbers: this.selectedCountry.code
    });
  }
  onCodeChanged(code: string) {
    code.length == 5 ? (this.codeEntered = true) : (this.codeEntered = false);
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
      this.router.navigate(['auth/register'], { queryParams: { phone: this.form.value.code + this.form.value.number } });
    }
  }
  onPhoneNumberChange(inputValue: string): void {
    clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(() => {
      let inputCode: string;
      if (inputValue.startsWith('7')) {
        inputCode = inputValue.startsWith('+')
          ? inputValue.split(' ')[0]
          : '+' + inputValue.substring(0, 1);
      } else {
        inputCode = inputValue.startsWith('+')
          ? inputValue.split(' ')[0]
          : '+' + inputValue.substring(0, 3);
      }
      const matchedCountry = this.countries.find(country => country.code === inputCode);
      this.phoneCodeInvalid = false;
      if (matchedCountry) {
        if (matchedCountry.code !== this.selectedCountry.code) {
          this.selectCountry(matchedCountry);
        }
      } else {
        this.phoneCodeInvalid = true;
      }
    }, 300);
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
