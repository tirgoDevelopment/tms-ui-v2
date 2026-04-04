import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
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
import { generateQueryFilter } from '../../pipes/queryFIlter';
import { jwtDecode } from 'jwt-decode';
import { ChatPanelService } from '../../services/chat-panel.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-main',
  imports: [FormsModule, TranslateModule, NzModules, NgIf, RouterLink, RouterOutlet, ChatComponent],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  standalone: true,
})
export class MainComponent implements OnInit, OnDestroy {
  chatIconPosition = { x: 0, y: 0 };
  currentUser: any;
  isLoading: boolean = false;
  theme: 'light' | 'dark';
  isCollapsed = true;
  selectedFlag: string = '../assets/images/flags/US.svg';
  selectedLanguage = 'en';
  userName: string = 'Super Admin';
  isDarkMode: boolean = false;
  isChatVisible: boolean = false;
  selectedServiceId: string | null = null;
  selectedChatId: string | null = null;
  sseSubscription
  newMessageCount = 0
  private readonly destroy$ = new Subject<void>();
  constructor(
    private cdr: ChangeDetectorRef,
    public themeService: ThemeService,
    private translate: TranslateService,
    public authService: AuthService,
    private router: Router,
    private serviceApi: ServicesService,
    private pushService: PushService,
    private socketService: SocketService,
    private chatPanelService: ChatPanelService) {
  }
  ngOnInit(): void {
    this.currentUser = jwtDecode(localStorage.getItem('accessTokenTms') || '');
    const lang = localStorage.getItem('lang') || 'ru';
    this.changeLanguage(lang.toLocaleLowerCase(), `../assets/images/flags/${lang}.svg`);
    this.themeService.initTheme();
    this.getChats();
    this.chatPanelService.state$.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      this.selectedServiceId = state.serviceId;
      this.selectedChatId = state.chatId;
      this.isChatVisible = state.isOpen;
      this.cdr.detectChanges();
    });

    this.socketService.listen('newMessage').pipe(takeUntil(this.destroy$)).subscribe((event) => {
      this.newMessageCount = this.newMessageCount + 1;
      this.pushService.showPushNotification(`Новое сообщение поступило на услугу в id ${event.data.requestId}`, event.data.message.message, 'service');
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
    if (this.isChatVisible) {
      this.chatPanelService.close();
    } else {
      this.chatPanelService.open();
    }
  }
  closeChat() {
    this.chatPanelService.close();
  }
  setInitialChatIconPosition() {
    const padding = 16;
    this.chatIconPosition = {
      x: window.innerWidth - 64 - padding,
      y: window.innerHeight - 64 - padding
    };
  }
  getChats() {
    this.serviceApi.getDriverServices(generateQueryFilter({ servicesIds: [], excludedServicesIds: [15,16] })).subscribe({
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