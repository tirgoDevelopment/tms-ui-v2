import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModules } from 'src/app/shared/modules/common.module';
import { NzModules } from 'src/app/shared/modules/nz-modules.module';
import { Response } from 'src/app/shared/models/reponse';
import { NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { PipeModule } from 'src/app/shared/pipes/pipes.module';
import { NgxMaskDirective } from 'ngx-mask';
import { removeDuplicateKeys } from 'src/app/shared/pipes/remove-dublicates-formData';
import { DriverModel } from '../../models/driver.model';
import { DriversService } from '../../services/drivers.service';
import { jwtDecode } from 'jwt-decode';
import { AddTransportComponent } from '../add-transport/add-transport.component';
import { Router } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, Observable, of, Subject, switchMap } from 'rxjs';
import { generateQueryFilter } from 'src/app/shared/pipes/queryFIlter';
import { CodeInputModule } from 'angular-code-input';

@Component({
  selector: 'app-driver-form',
  templateUrl: './driver-form.component.html',
  styleUrls: ['./driver-form.component.scss'],
  standalone: true,
  imports: [NzModules, TranslateModule, CommonModules, NzModalModule, PipeModule, NgxMaskDirective, CodeInputModule]
})
export class DriverFormComponent implements OnInit {
  confirmModal?: NzModalRef;
  @Input() id?: number | string;
  @Input() mode?: 'add' | 'edit' | 'view';
  @Output() close = new EventEmitter<void>();
  showForm: boolean = false;
  loading: boolean = false;
  edit: boolean = false;
  timerOtp
  countdown: number = 119;
  intervalId: any;
  isCodeExpired: boolean = false;
  codeEntered: boolean = false;
  verifyCode: string; fileRemovedPassport: boolean = false;
  previewUrlPassport: any;

  fileRemovedLicense: boolean = false;
  previewUrlLicense: string | ArrayBuffer | null = null;

  selectedFilePassport: File | null = null;
  selectedFileLicense: File | null = null;

  phoneVerified = false;
  form: FormGroup;
  data: DriverModel;
  countries = [
    { code: '+998', name: 'Uzbekistan', flag: 'assets/images/flags/UZ.svg' },
    { code: '+7', name: 'Kazakhstan', flag: 'assets/images/flags/KZ.svg' },
    { code: '+7', name: 'Russia', flag: 'assets/images/flags/RU.svg' },
    { code: '+992', name: 'Tajikistan', flag: 'assets/images/flags/TJ.png' },
    { code: '+996', name: 'Kyrgyzstan', flag: 'assets/images/flags/KG.png' },
  ];
  selectedCountry: { code: string; name: string; flag: string } = this.countries[0];
  currentMask: string = '+000 00 000-00-00';
  currentUser: any;
  loadingPage: boolean = false;
  drivers$!: Observable<any>;
  searchDriver$ = new Subject<string>();
  selectedDriver: any;
  otpCode

  debounceTimeout
  phoneCodeInvalid = false;
  constructor(
    private modal: NzModalService,
    private toastr: NotificationService,
    private drawerRef: NzDrawerRef,
    private driversService: DriversService,
    private translate: TranslateService,
    private drawer: NzDrawerService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.drivers$ = this.searchDriver$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((searchTerm: string) => this.driversService.getAllAdmin(searchTerm).pipe(
        catchError((err) => {
          return of({ data: { content: [] } });
        })
      )),
    );

    this.currentUser = jwtDecode(localStorage.getItem('accessTokenTms'));
    this.edit = this.mode === 'edit';
    this.form = new FormGroup({
      id: new FormControl(''),
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      phoneNumbers: new FormControl([], Validators.required),
      email: new FormControl('', []),
      passport: new FormControl('', []),
      driverLicense: new FormControl('', []),
      isOwnBalance: new FormControl(false),
      isOwnService: new FormControl(false),
      isOwnOrder: new FormControl(false),
      isKzPaidWay: new FormControl(false),
    });
    this.selectCountry(this.countries[0]);

    if (this.mode == 'view' || this.mode == 'edit') {
      this.getById();
    }
  }
  getById() {
    if (this.id && (this.mode == 'view' || this.mode == 'edit')) {
      this.loadingPage = true;
      this.driversService.getById(this.id).subscribe((res: Response<DriverModel>) => {
        this.data = res.data;
        this.patchForm();
        this.loadingPage = false;
      }, err => {
        this.loadingPage = false;
      });
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
  patchForm() {
    if (this.data) {
      this.previewUrlPassport = this.data?.passportFilePath;
      this.previewUrlLicense = this.data?.driverLicenseFilePath;
      this.edit = true;
      const mainPhoneNumber = this.data?.phoneNumbers?.find(phone => phone.isMain ? phone.isMain : this.data?.phoneNumbers[0]);

      if (mainPhoneNumber) {
        if (mainPhoneNumber.code === '99' && mainPhoneNumber.number.startsWith('8')) {
          mainPhoneNumber.code = '998';
          mainPhoneNumber.number = mainPhoneNumber.number.substring(1);
        }
      }

      const matchedCountry = this.countries.find(country => country.code === '+' + mainPhoneNumber.code);

      this.selectCountry(matchedCountry);
      const formattedPhoneNumber = mainPhoneNumber ? `+${mainPhoneNumber.code}${mainPhoneNumber.number}` : '';
      this.form.patchValue(this.data);
      this.form.patchValue({
        phoneNumbers: formattedPhoneNumber
      });
    }
  }
  private extractPhoneNumber(phoneNumber: string, countryCode: string): { number: string; code: string } | null {
    const codeMappings: { [key: string]: { dialCode: string; sliceIndex: number } } = {
      '+998': { dialCode: '998', sliceIndex: 3 },
      '+992': { dialCode: '992', sliceIndex: 3 },
      '+996': { dialCode: '996', sliceIndex: 3 },
      '+7': { dialCode: '7', sliceIndex: 1 }
    };

    const mapping = codeMappings[countryCode];
    if (!mapping) return null;

    const numberWithoutCode = phoneNumber.replace(/[^0-9]/g, "").slice(mapping.sliceIndex);
    return { number: numberWithoutCode, code: mapping.dialCode };
  }
  sendSms() {
    const phoneNumbers = this.form.value.phoneNumbers;
    const selectedCountryCode = this.selectedCountry.code;

    const extracted = this.extractPhoneNumber(phoneNumbers, selectedCountryCode);
    if (!extracted) {
      this.toastr.error('Noto‘g‘ri mamlakat kodi tanlandi.', 'Xatolik');
      return;
    }
    const data = {
      number: extracted.number,
      code: extracted.code,
      userType: "driver",
      sendBy: "sms"
    };
    this.loading = true;
    this.driversService.sendOtp(data).subscribe({
      next: (res: any) => {
        this.loading = false;

        if (res?.success) {
          if (res.data.isRegistered) {
            this.toastr.error('Водитель уже зарегистрирован.', 'Пожалуйста, отправьте запрос на водтитель.');
          } else {
            this.toastr.success('Код отправлен успешно', '');
            this.otpCode = res.data.otpCode;
            this.isCodeExpired = false;
            this.countdown = 119;
            this.startCountdown();
          }
        }
      },
      error: (err) => {
        console.error('Error sending OTP:', err);
        this.toastr.error('Xatolik yuz berdi. Iltimos, qaytadan urinib ko‘ring.', 'Xatolik');
        this.loading = false;
      }
    });
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
  sendVerifyedCode() {
    this.loading = true;
    if (this.isCodeExpired) {
      this.loading = false;
      this.toastr.error('Срок действия SMS-кода истек. Пожалуйста, запросите новый.', '');
    }
    else if (this.otpCode != this.verifyCode) {
      this.loading = false;
      this.toastr.error('Пароль не совпадает', '');
    }
    else if (this.otpCode == this.verifyCode) {
      this.phoneVerified = true;
      this.loading = false;
    }
  }
  onCancel(): void {
    this.drawerRef.close({ success: false });
    this.form.reset();
  }
  onSubmit() {
    const formData = new FormData();
    formData.append('id', this.form.get('id')?.value);
    formData.append('firstName', this.form.get('firstName')?.value);
    formData.append('lastName', this.form.get('lastName')?.value);
    formData.append('email', this.form.get('email')?.value);
    formData.append('isOwnBalance', this.form.get('isOwnBalance')?.value);
    formData.append('isOwnService', this.form.get('isOwnService')?.value);
    formData.append('isOwnOrder', this.form.get('isOwnOrder')?.value);
    formData.append('isKzPaidWay', this.form.get('isKzPaidWay')?.value);
    let phoneNumbers: any[] = [];
    if (this.selectedCountry.code === '+998' || this.selectedCountry.code === '+992' || this.selectedCountry.code === '+996') {
      phoneNumbers.push({
        code: this.form.value.phoneNumbers.substring(0, 3),
        number: this.form.value.phoneNumbers.substring(3),
        isMain: true,
      });
    }
    else if (this.selectedCountry.code === '+7') {
      phoneNumbers.push({
        code: this.form.value.phoneNumbers.substring(0, 1),
        number: this.form.value.phoneNumbers.substring(1),
        isMain: true,
      });
    }
    formData.append('phoneNumbers', JSON.stringify(phoneNumbers));
    if (this.selectedFilePassport) {
      const file = new File([this.selectedFilePassport], Date.now() + this.selectedFilePassport.name, { type: this.selectedFilePassport.type });
      formData.append('passport', file);
    }
    if (this.selectedFileLicense) {
      const file = new File([this.selectedFileLicense], Date.now() + this.selectedFileLicense.name, { type: this.selectedFileLicense.type });
      formData.append('driverLicense', file);
    }
    this.form.value.isKzPaidWay = this.data.isKzPaidWay
    this.loading = true;
    const uniqueFormData = removeDuplicateKeys(formData);

    const submitObservable = this.data
      ? this.driversService.update(this.form.get('id')?.value, uniqueFormData)
      : this.driversService.create(uniqueFormData);

    submitObservable.subscribe(
      (res: any) => {
        if (res && res.success) {
          this.loading = false;
          const messageKey = this.data ? 'successfullUpdated' : 'successfullCreated';
          this.toastr.success(this.translate.instant(messageKey), '');
          this.drawerRef.close({ success: true, mode: this.data ? 'edit' : 'add', driverId: res.data?.id });
          this.form.reset();
        }
      },
      (error) => {
        this.loading = false;
      }
    );
  }
  onFileSelected(event: Event, type: 'passport' | 'license'): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files ? fileInput.files[0] : null;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (type === 'passport') {
          this.selectedFilePassport = file;
          this.previewUrlPassport = reader.result;
          this.form.get('passport')?.setValue(file);
          this.form.get('passport')?.updateValueAndValidity();
        } else if (type === 'license') {
          this.selectedFileLicense = file;
          this.previewUrlLicense = reader.result;
          this.form.get('driverLicense')?.setValue(file);
          this.form.get('driverLicense')?.updateValueAndValidity();
        }
      };
      reader.readAsDataURL(file);
    }
  }
  removeFile(fileType: 'passport' | 'license'): void {
    if (fileType === 'passport') {
      this.fileRemovedPassport = true;
      this.previewUrlPassport = null;
      this.selectedFilePassport = null;
    } else if (fileType === 'license') {
      this.fileRemovedLicense = true;
      this.previewUrlLicense = null;
      this.selectedFileLicense = null;
    }
  }

  onBlock() {
    if (this.data.blocked) {
      this.driversService.unblock(this.data.id).subscribe((res: Response<DriverModel>) => {
        this.toastr.success(this.translate.instant('successfullyActivated'), '');
        this.drawerRef.close({ success: true });
      });
    }
    else {
      this.blockModal()
    }
  }
  blockModal(): void {
    this.confirmModal = this.modal.confirm({
      nzTitle: this.translate.instant('are_you_sure'),
      nzContent: this.translate.instant('block_sure'),
      nzOkText: this.translate.instant('block'),
      nzCancelText: this.translate.instant('cancel'),
      nzOkDanger: true,
      nzOnOk: () => {
        this.driversService.block(this.data.id).subscribe((res: any) => {
          if (res?.success) {
            this.toastr.success(this.translate.instant('successfullBlocked'), '');
            this.drawerRef.close({ success: true });
          }
        });
      }
    });
  }
  addTransport() {
    const drawerRef: any = this.drawer.create({
      nzTitle: this.translate.instant('add_transport'),
      nzContent: AddTransportComponent,
      nzPlacement: 'right',
      nzContentParams: {
        driverId: this.data.id,
        mode: 'add'
      }
    });
    drawerRef.afterClose.subscribe((res: any) => {
      if (res && res?.success) {
        this.getById()
        this.drawerRef.close({ success: true });
      }
    });
  }
  editTransport(item: any) {
    const drawerRef: any = this.drawer.create({
      nzTitle: this.translate.instant('edit_transport'),
      nzContent: AddTransportComponent,
      nzPlacement: 'right',
      nzContentParams: {
        driverId: this.data.id,
        data: item,
        mode: 'edit'
      }
    });
    drawerRef.afterClose.subscribe((res: any) => {
      this.getById()
    });
  }
  allOrders() {
    this.router.navigate(['/orders', { driverId: this.data.id }]);
    this.drawerRef.close({ success: true });
  }
  findDriver(ev: string) {
    let query = generateQueryFilter({ driverId: ev });
    this.searchDriver$.next(query);
  }
  onSendRequest() {
    this.loading = true;
    this.driversService.sendRequestToAddDriver({ driverId: this.selectedDriver, tmsId: this.currentUser.merchantId }).subscribe((res: any) => {
      this.loading = false;
      if (res && res?.success) {
        this.toastr.success(this.translate.instant('successfullSendRequest'), this.translate.instant('wait_for_response'));
        this.drawerRef.close({ success: true });
      }
    }, err => {
      this.loading = false;
    });
  }
  onCodeChanged(code: string) {
    code.length == 6 ? (this.codeEntered = true) : (this.codeEntered = false);
    this.verifyCode = code;
  }
}