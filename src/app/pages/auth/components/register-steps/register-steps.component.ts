import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzModules } from 'src/app/shared/modules/nz-modules.module';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgxMaskDirective } from 'ngx-mask';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { jwtDecode } from 'jwt-decode';
import { PipeModule } from 'src/app/shared/pipes/pipes.module';
import { removeDuplicateKeys } from 'src/app/shared/pipes/remove-dublicates-formData';
import { CurrenciesService } from 'src/app/shared/services/references/currencies.service';

@Component({
  selector: 'app-register-steps',
  templateUrl: './register-steps.component.html',
  styleUrls: ['./register-steps.component.scss'],
  standalone: true,
  imports: [CommonModule, NzModules, FormsModule, ReactiveFormsModule, RouterModule, TranslateModule, NgxMaskDirective, PipeModule]
})
export class RegisterStepsComponent implements OnInit {
  phone: string;
  form: FormGroup;
  formStep2: FormGroup;
  passwordVisible: boolean = false;
  step: number = 1;
  merchant: any;
  formData = new FormData()
  registerCompleted: boolean;
  registerRejected:boolean;
  edit: boolean = false;

  logo: string | ArrayBuffer | null = null;
  registrationCertificate: string | ArrayBuffer | null = null;
  passport: string | ArrayBuffer | null = null;
  transportationCertificate: string | ArrayBuffer | null = null;
  currencies: any;
  showBankAccount2: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private toastr: NotificationService,
    private currenciesApi: CurrenciesService,
    private router: Router,
    private translate: TranslateService
  ) {
    this.route.queryParams.subscribe((params: any) => {
      this.phone = params.phone;
    });
  }
  ngOnInit(): void {
    this.getCurrency();
    this.initForms();
    if (this.authService.accessToken) {
      let user: any = jwtDecode(this.authService.accessToken);
      this.getMerchant(user.merchantId);
    }else {
      this.authService.logout();
    }
  }

  private initForms(): void {
    this.form = this.formBuilder.group({
      companyType: ['ООО', Validators.required],
      companyName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      agreement: [false, Validators.requiredTrue],
      phoneNumber: [this.phone, Validators.required],
    });

    this.formStep2 = this.formBuilder.group({
      merchantId: [''],
      supervisorFirstName: ['', Validators.required],
      supervisorLastName: ['', Validators.required],
      responsiblePersonFirstName: ['', Validators.required],
      responsiblePersonLastName: ['', Validators.required],
      bankAccounts: [null],
      currency: [null, [Validators.required]],
      bankAccount: [null, [Validators.required, Validators.maxLength(20), Validators.minLength(20), Validators.pattern('^[0-9]*$')]],
      currency2: [null],
      bankAccount2: [null, [Validators.minLength(20), Validators.maxLength(20), Validators.pattern('^[0-9]*$')]],
      bankBranchName: [null, [Validators.required]],
      bankName: [null, [Validators.required]],
      inn: [null, [Validators.required]],
      taxPayerCode: [null, [Validators.minLength(12), Validators.maxLength(12), Validators.required]],
      oked: [null, [Validators.required]],
      mfo: [null, [Validators.required, Validators.required, Validators.maxLength(5), Validators.minLength(5), Validators.pattern('^[0-9]*$')]],
      dunsNumber: [null],
      ibanNumber: [null],
      notes: [null],
      garageAddress: [null],
      postalCode: [null],
      responsbilePersonPhoneNumber: [null],
      phoneNumber: [null, Validators.required],
      responsiblePersonFistName: [null],
      legalAddress: [null],
      passport:[null],
    });
  }
  getCurrency() {
    this.currenciesApi.getAll().subscribe((res: any) => {
      if (res && res.success) {
        this.currencies = res.data;
        this.formStep2.patchValue({ currency: this.currencies[0].id, currency2: this.currencies[0].id });
      }
    })
  }
  onSubmit() {
    if(this.form.value.confirmPassword !=  this.form.value.password) {
      this.toastr.error('Пароли не совпадают');
    }else {
      this.form.enable();
      this.authService.merchantCreate(this.form.value).subscribe((res: any) => {
        if (res.success) {
          this.form.enable();
          this.authService.signIn({ username: this.form.value.email, password: this.form.value.password, userType: 'driver_merchant_user' }).subscribe((res: any) => {
            this.authService.accessToken = res.data.token;
            let user: any = jwtDecode(res.data.token);
            this.getMerchant(user.merchantId);
          })
          this.toastr.success("Мерчант успешно добавлен");
        }
      }, error => {
        if (error.error.message == "email must be an email") {
          this.form.enable();
          this.toastr.error('Неверный формат электронной почты');
        }
      })
    }
  }
  onSubmit2() {
    this.formStep2.disable();
    if (this.step == 2) {
      if (this.formStep2.value.supervisorFirstName === null) {
        this.formStep2.enable();
        this.toastr.error('Требуется указать Имя руководителя');
      }
      else if (this.formStep2.value.supervisorLastName === null) {
        this.formStep2.enable();
        this.toastr.error('Требуется указать Фамилия руководителя');
      }
      else if (this.formStep2.value.phoneNumber === null) {
        this.formStep2.enable();
        this.toastr.error('Требуется указать Телефон руководителя');
      }
      else if (this.formStep2.value.responsiblePersonFistName === null) {
        this.formStep2.enable();
        this.toastr.error('Требуется указать Имя ответственного лица');
      }
      else if (this.formStep2.value.responsiblePersonLastName === null) {
        this.formStep2.enable();
        this.toastr.error('Требуется указать Фамилия ответственного лица');
      }
      else if (this.formStep2.value.responsbilePersonPhoneNumber === null) {
        this.formStep2.enable();
        this.toastr.error('Требуется указать Телефон ответственного лица');
      }
      else if (this.formStep2.value.address === null) {
        this.formStep2.enable();
        this.toastr.error('Требуется указать Юридический адрес');
      }
      else {
        this.formData.append('merchantId', this.merchant.id)
        this.formData.append('supervisorFirstName', this.formStep2.value.supervisorFirstName)
        this.formData.append('supervisorLastName', this.formStep2.value.supervisorLastName)
        this.formData.append('responsiblePersonFistName', this.formStep2.value.responsiblePersonFistName)
        this.formData.append('responsiblePersonLastName', this.formStep2.value.responsiblePersonLastName)
        this.formData.append('responsbilePersonPhoneNumber', this.formStep2.value.responsbilePersonPhoneNumber)
        this.formData.append('factAddress', this.formStep2.value.factAddress)
        this.formData.append('legalAddress', this.formStep2.value.legalAddress)
        this.formData.append('garageAddress', this.formStep2.value.garageAddress)
        this.formData.append('postalCode', this.formStep2.value.postalCode)
        let unique = removeDuplicateKeys(this.formData);
        this.authService.merchantUpdate(unique).subscribe((res: any) => {
          if (res && res.success) {
            this.formStep2.enable();
            this.step = 3;
            // this.router.navigate(['register/step3']);
          }
        }, (error: any) => {
          this.formStep2.enable();
          this.toastr.error(error.message);
        })
      }
    }
    if (this.step == 3) {
      this.formStep2.disable();
      if (this.formStep2.value.bankName === '' || this.formStep2.value.bankName === null) {
        this.formStep2.enable();
        this.toastr.error('Требуется указать Наименование банка');
      }
      if (this.formStep2.value.bankBranchName === '' || this.formStep2.value.bankBranchName === null) {
        this.formStep2.enable();
        this.toastr.error('Требуется указать Наименование филиала банка');
      }
      else if (this.formStep2.value.bankAccount === '' || this.formStep2.value.bankAccount === null) {
        this.formStep2.enable();
        this.toastr.error('Требуется указать Расчетный счет');
      }
      else if (this.formStep2.value.inn === '' || this.formStep2.value.inn === null) {
        this.formStep2.enable();
        this.toastr.error('Требуется указать ИНН');
      }
      else if (this.formStep2.value.taxPayerCode === '' || this.formStep2.value.taxPayerCode === null) {
        this.formStep2.enable();
        this.toastr.error('Требуется указать Код плательщика НДС');
      }
      else if (this.formStep2.value.oked === '' || this.formStep2.value.oked === null) {
        this.formStep2.enable();
        this.toastr.error('Требуется указать Код плательщика ОКЭД');
      }
      else if (this.formStep2.value.mfo === '' || this.formStep2.value.mfo === null) {
        this.formStep2.enable();
        this.toastr.error('Требуется указать Код плательщика МФО');
      }
      else {
        if (this.formStep2.value.bankAccount2 == '') {
          this.formStep2.patchValue({
            responsiblePersonLastName: this.merchant.responsiblePersonLastName,
            responsiblePersonFistName: this.merchant.responsiblePersonFistName,
            registrationCertificate: this.merchant.registrationCertificate,
            passport: this.merchant.passport,
            logo: this.merchant.logo,
            responsbilePersonPhoneNumber: this.merchant.responsbilePersonPhoneNumber,
            supervisorFirstName: this.merchant.supervisorFirstName,
            supervisorLastName: this.merchant.supervisorLastName,
            legalAddress: this.merchant.legalAddress,
            factAddress: this.merchant.factAddress,

            merchantId: +this.merchant.id,
            companyName: this.merchant.companyName,
            companyType: this.merchant.companyType,
            password: this.merchant.password,
            phoneNumber: this.merchant.phoneNumber,
            email: this.merchant.email,
            bankAccounts: [
              { account: +this.formStep2.value.bankAccount, currencyId: this.formStep2.value.currency },
              { account: +this.formStep2.value.bankAccount2, currencyId: this.formStep2.value.currency2 },
            ]
          });
        } else {
          this.formStep2.patchValue({
            responsiblePersonLastName: this.merchant.responsiblePersonLastName,
            responsiblePersonFistName: this.merchant.responsiblePersonFistName,
            registrationCertificate: this.merchant.registrationCertificate,
            passport: this.merchant.passport,
            logo: this.merchant.logo,
            responsbilePersonPhoneNumber: this.merchant.responsbilePersonPhoneNumber,
            supervisorFirstName: this.merchant.supervisorFirstName,
            supervisorLastName: this.merchant.supervisorLastName,
            legalAddress: this.merchant.legalAddress,
            factAddress: this.merchant.factAddress,

            merchantId: Number(this.merchant.id),
            companyName: this.merchant.companyName,
            companyType: this.merchant.companyType,
            password: this.merchant.password,
            phoneNumber: this.merchant.phoneNumber,
            email: this.merchant.email,
            bankAccounts: [
              { account: +this.formStep2.value.bankAccount, currencyId: this.formStep2.value.currency }
            ]
          });
        }
        this.authService.merchantComplete(this.formStep2.value).subscribe((res: any) => {
          if (res && res.success) {
            this.formStep2.enable();
            this.step = 1;
            this.registerCompleted = true;
            this.toastr.success('Регистрация завершена');
          }
          else {
            this.formStep2.enable();
          }
        }, (err) => {
          this.formStep2.enable();
          this.toastr.error('Ошибка при завершении регистрации');
        })
      }
    }
  }
  getMerchant(id: string | number) {
    this.authService.getMerchantById(id).subscribe((merchant: any) => {
      this.merchant = merchant.data;
      this.form.patchValue(this.merchant);
      this.formStep2.patchValue(this.merchant);
      this.checkRegisterStep();
    })
  }
  checkRegisterStep() {
    if (this.merchant.completed) {
      if (this.merchant.rejected && !this.merchant.verified) {
        this.registerRejected = true;
        this.registerCompleted = false;
        return;
      }
      if (!this.merchant.rejected && !this.merchant.verified) {
        this.registerCompleted = true;
        this.registerRejected = false;
        return; 
      }
    }
    this.registerCompleted = false;
    this.registerRejected = false;
  
    if (!this.merchant.companyName || !this.merchant.email) {
      this.step = 1;
      return;
    }
  
    if (!this.merchant.supervisorFirstName || !this.merchant.supervisorLastName) {
      this.step = 2;
      return;
    }
    this.step = 3;
  }
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }
  selectFile(event: Event, name: keyof RegisterStepsComponent) {
    const input = event.target as HTMLInputElement;
    if (input && input.files) {
      const file: File = input.files[0];
      if (file) {
        const maxSizeInMB = 2;
        const maxSizeInBytes = maxSizeInMB * 1024;
        if (file.size > maxSizeInBytes) {
          this.toastr.error(this.translate.instant('fileSize'))
          return;
        }
        this.formData.append(name, file, new Date().getTime().toString() + '.jpg');
        const reader = new FileReader();
        reader.onload = () => {
          (this as any)[name] = reader.result;
        };
        reader.readAsDataURL(file);
      }
    }
  }
    
  toggleShowBankAccount2() {
    this.showBankAccount2 = !this.showBankAccount2;
  }
  redirectToAuth() {
    this.authService.logout()
    this.router.navigate(['/auth/sign-in']);
  }
}

