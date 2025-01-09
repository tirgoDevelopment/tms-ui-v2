import { ChangeDetectorRef, Component } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { NzModules } from '../../modules/nz-modules.module';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from 'src/app/pages/auth/services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { ChatComponent } from '../chat/chat.component';
import { SocketService } from '../../services/socket.service';
import { ServicesService } from 'src/app/pages/services/services/services.service';
import { PushService } from '../../services/push.service';

@Component({
  selector: 'app-main',
  imports: [FormsModule, TranslateModule, NzModules, NgIf, RouterLink, RouterOutlet, ChatComponent],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  standalone: true,
})
export class MainComponent {
  chatIconPosition = { x: 0, y: 0 };

  isLoading: boolean = false;
  theme: 'light' | 'dark';
  isCollapsed = true;
  selectedFlag: string = '../assets/images/flags/US.svg';
  selectedLanguage = 'en';
  userName: string = 'Super Admin';
  isDarkMode: boolean = false;
  isChatVisible: boolean = false;
  sseSubscription
  newMessageCount = 0
  constructor(
    private cdr: ChangeDetectorRef,
    public themeService: ThemeService,
    private translate: TranslateService,
    public authService: AuthService,
    private router: Router,
    private serviceApi: ServicesService,
    private pushService: PushService,
    private socketService: SocketService) {
  }
  ngOnInit(): void {
    const lang = localStorage.getItem('lang') || 'ru';
    this.changeLanguage(lang.toLocaleLowerCase(), `../assets/images/flags/${lang}.svg`);
    this.themeService.initTheme();
    this.sseSubscription = this.socketService.getSSEEvents().subscribe((event) => {
      if (event.event === 'newMessage') {
        this.newMessageCount = this.newMessageCount + 1;
        this.pushService.showPushNotification(`Новое сообщение поступило на услугу в id ${event.data.requestId}`, event.data.message.message, 'service');
        this.cdr.detectChanges();
      }
      else if (event.event === 'tmsBalanceTopup') {
        this.pushService.showPushNotification(`ГСМ запрос на объем ${event.data.amount} литров ${event.data.isRejected ? 'отклонен' : 'принят'}`, '', 'gsm');
      }
      else if(event.event == 'serviceRequestPriced') {
        this.pushService.showPushNotification(`Услуга в id ${event.data.requestId} оценена`, '', 'service');
      }
      else if(event.event == 'serviceRequestToWorking') {
        this.pushService.showPushNotification(`Услуга в id ${event.data.requestId} в работе`, '', 'service');
      }
      else if(event.event == 'serviceRequestToCompleted') {
        this.pushService.showPushNotification(`Услуга в id ${event.data.requestId} выполнена`, '', 'service');
      }
      else if(event.event == 'serviceRequestCanceled') {
        this.pushService.showPushNotification(`Услуга в id ${event.data.requestId} отменена`, '', 'service');
      }
    });
    this.getChats();
  }
  changeLanguage(language: string, flag: string): void {
    this.selectedFlag = flag;
    this.translate.use(language.toLocaleLowerCase());
    localStorage.setItem('lang', language.toLocaleUpperCase());
  }
  toggleTheme() {
    const newTheme = this.themeService.colorTheme === 'light-mode' ? 'dark-mode' : 'light-mode';
    this.themeService.setTheme(newTheme);
  }

  logout() {
    this.authService.signOut();
    // this.router.navigate(['/auth/sign-in']);
  }
  toggleChat() {
    this.isChatVisible = !this.isChatVisible;
  }
  closeChat() {
    this.isChatVisible = false;
  }
  setInitialChatIconPosition() {
    const padding = 16;
    this.chatIconPosition = {
      x: window.innerWidth - 64 - padding,
      y: window.innerHeight - 64 - padding
    };
  }
  getChats() {
    this.serviceApi.getDriverServices().subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.newMessageCount = res.data.content.reduce((total, item) => total + (item.unreadMessagesCount || 0), 0);
        }
      },
      error: (error) => {
      },
      complete: () => {
      },
    });
  }
  updateNewMessageCount(count: number) {
    this.newMessageCount += count;
  }
}