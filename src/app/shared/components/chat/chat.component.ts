import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  ViewChild,
  Input,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { ServicesService } from 'src/app/pages/services/services/services.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { generateQueryFilter } from '../../pipes/queryFIlter';
import { SocketService } from '../../services/socket.service';
import { PushService } from '../../services/push.service';
import { CommonModule, DatePipe, NgClass, NgStyle } from '@angular/common';
import { FileFetchPipe } from '../../pipes/file-fetch.pipe';
import { FileFormatPipe } from '../../pipes/fileType.pipe';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzInputModule } from 'ng-zorro-antd/input';
import { PipeModule } from '../../pipes/pipes.module';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  standalone: true,
  imports: [
    NgStyle, NgClass, CommonModule, PipeModule,
    NzIconModule, NzSpinModule, NzInputModule, NzImageModule, NzSpaceModule, NzPopconfirmModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule
  ],
})
export class ChatComponent implements OnInit {
  searchControl = new FormControl();
  @Input() chat: any;
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @ViewChild('messageInput') private messageInput!: ElementRef;
  @Output() closeChatEvent = new EventEmitter<void>();
  @Output() newMessageCountChange = new EventEmitter<number>();
  @Input() outputServiceId: string;
  @Input() outputChatId: string;

  chatIconPosition = { x: 50, y: 50 };
  chatSize = { width: 400, height: 500 };
  observer: MutationObserver | null = null;

  private isDragging = false;
  private dragOffset = { x: 0, y: 0 };
  private dragSpeedFactor = 1;
  messages: any[] = [];
  groupedMessages: { [key: string]: any[] } = {};
  chats: any[] = [];
  filteredChats: any[] = [];
  selectedChat: any | null = null;
  showChatList: boolean = true;
  loading: boolean = false;
  loadingMore: boolean = false;
  noMoreChats: boolean = false;
  sseSubscription
  newMessage: string = '';
  editingMessage: any | null = null;
  replyingTo: any | null = null;
  selectedMessages: Set<string> = new Set();
  isSelectionMode: boolean = false;
  allowedFileTypes = '.png,.jpg,.jpeg,.pdf';
  maxFileSize = 10 * 1024 * 1024;
  highlightedMessageId: string | null = null;
  selectedFile: File | null = null;
  serviceId: string = '';
  loadingFile: boolean = false;
  totalPagesCount
  private pageParams = {
    pageIndex: 1,
    pageSize: 10,
    totalPagesCount: 1,
    sortBy: '',
    sortType: '',
    servicesIds: [],
    chatId: null,
    excludedServicesIds: [15, 16],
    serviceId: this.serviceId,
  };
  private messagesParams = {
    pageIndex: 1,
    pageSize: 10,
  }
  

  constructor(
    private serviceApi: ServicesService,
    private translate: TranslateService,
    private socketService: SocketService,
    private pushService: PushService,
    private el: ElementRef
  ) {
    const currentLang = localStorage.getItem('lang') || 'us';
    this.translate.use(currentLang.toLowerCase());

   

  }

  ngAfterViewInit() {
    const chatCard = this.el.nativeElement.querySelector('.chat-card') as HTMLElement;
    const savedSize = localStorage.getItem('chatSize');
    if (savedSize) {
      this.chatSize = JSON.parse(savedSize);
      chatCard.style.width = `${this.chatSize.width}px`;
      chatCard.style.height = `${this.chatSize.height}px`;
    }
    this.observer = new MutationObserver(() => {
      this.chatSize.width = chatCard.clientWidth;
      this.chatSize.height = chatCard.clientHeight;
      localStorage.setItem('chatSize', JSON.stringify(this.chatSize));
    });
    this.observer.observe(chatCard, { attributes: true, attributeFilter: ['style'] });
  }

  ngOnInit() {
    const savedPosition = localStorage.getItem('chatPosition');
    if (savedPosition) {
      this.chatIconPosition = JSON.parse(savedPosition);
    }
    if (this.outputServiceId) {
      this.showChatList = false;
      this.loading = true;
      this.serviceApi.getServiceRequestById(this.outputServiceId).subscribe((res: any) => {
        this.selectChat(res.data.data)
      })
    }
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((searchTerm) => {
        this.pageParams.chatId = Number(searchTerm) ;
        this.getChats();
      });
    this.getChats();
  }

  ngOnDestroy() {
    if (this.sseSubscription) {
      this.sseSubscription.unsubscribe();
    }
    // this.socketService.disconnect();
  }
  getChats() {
    this.loading = true;
    this.pageParams.pageIndex = 1;
    this.noMoreChats = false;
    let query = generateQueryFilter(this.pageParams);
    this.serviceApi.getChatRooms(query).subscribe({
      next: (res: any) => {
        this.chats = res.data.content;
        this.pageParams.totalPagesCount = res.data.totalPagesCount || 1;
      },
      error: (error) => {
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
  getChatMessages() {
    this.loading = true;
    this.serviceApi.getChatMessages(this.outputChatId ? this.outputChatId : this.selectedChat.id, generateQueryFilter(this.messagesParams)).subscribe({
      next: (res: any) => {
        if (res?.data?.content) {
          this.messages = res.data.content.sort((a, b) => a.id - b.id);
          this.totalPagesCount = res.data.totalPagesCount
          this.groupMessagesByDate();

          this.showChatList = false;
          this.scrollToBottom();
        } else {
          this.messages = [];
          this.showChatList = false;
          // this.selectedChat = null;
        }
      },
      error: (error) => {
        this.showChatList = true;
        this.selectedChat = null;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
  selectChat(chat: any): void {
    if (!chat) return;
    this.chat = chat;
    this.selectedChat = chat;
    this.getChatMessages();
    if (chat.unreadMessagesCount) {
      this.patchUnreadCount();
    }
  }
  patchUnreadCount() {
    this.serviceApi.patchServiceCount(this.selectedChat.id).subscribe((res: any) => {
      if (res) {
        this.newMessageCountChange.emit(-this.selectedChat.unreadMessagesCount);
        this.selectedChat.unreadMessagesCount = 0;
      }
    })
  }
  backToList() {
    this.showChatList = true;
    this.selectedChat = null;
    this.messagesParams.pageIndex = 1
  }
  sendMessage() {
    if (this.newMessage.trim() && this.selectedChat) {
      const message: any = {
        senderUserType: "tms_user",
        createdAt: new Date(),
        message: this.newMessage,
        messageType: 'text',
        isReplied: this.replyingTo ? true : false,
        repliedToId: this.replyingTo ? this.replyingTo.id : null,
      };

      if (this.replyingTo) {
        message.replyTo = this.replyingTo;
        this.replyingTo = null;
      }
      this.serviceApi.postChatMessages(this.selectedChat.id, message).subscribe({
        next: (res: any) => {
          this.scrollToBottom();
          this.messages.push(message);
          // this.getChatMessages();
        },
        error: (error) => {
        },
        complete: () => {
          this.loading = false;
        },
      });
      this.newMessage = '';
      this.scrollToBottom();
    }
  }
  startReply(message: any) {
    this.replyingTo = message;
    this.editingMessage = null;
    this.messageInput.nativeElement.focus();
  }
  cancelReply() {
    this.replyingTo = null;
  }
  startEdit(message: any) {
    this.editingMessage = message;
    this.newMessage = message.message;
    this.replyingTo = null;
    this.messageInput.nativeElement.focus();
  }
  saveEdit() {
    if (this.editingMessage && this.newMessage.trim()) {
      this.editingMessage.text = this.newMessage.trim();
      this.editingMessage.edited = true;
      this.editingMessage = null;
      this.newMessage = '';
    }
  }
  cancelEdit() {
    this.editingMessage = null;
    this.newMessage = '';
  }
  toggleMessageSelection(message: any) {
    if (this.isSelectionMode) {
      if (this.selectedMessages.has(message.id)) {
        this.selectedMessages.delete(message.id);
      } else {
        this.selectedMessages.add(message.id);
      }
      if (this.selectedMessages.size === 0) {
        this.exitSelectionMode();
      }
    }
  }
  enterSelectionMode(message: any) {
    this.isSelectionMode = true;
    this.selectedMessages.add(message.id);
  }
  exitSelectionMode() {
    this.isSelectionMode = false;
    this.selectedMessages.clear();
  }
  previewFile(file: File) {
    if (file.type.startsWith('image/')) {
      this.previewImage(file);
    } else if (file.type === 'application/pdf') {
      this.previewPdf(file);
    }
  }
  fileUpload(file: File) {
    this.loadingFile = true;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('id', this.selectedChat.id);
    formData.append('isReplied', this.replyingTo ? 'true' : 'false');
    formData.append('repliedToId', this.replyingTo ? this.replyingTo.id : null);
    this.serviceApi.postChatMessagesFiles(this.selectedChat.id, formData).subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.getChatMessages();
        }
      },
      error: (error) => {
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
  private previewImage(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const message: any = {
        text: '',
        senderUserType: 'tms_user',
        createdAt: new Date(),
        file: {
          name: file.name,
          url: e.target.result,
          type: file.type,
          size: file.size,
        },
      };

      this.fileUpload(file);
      this.scrollToBottom();
    };
    reader.readAsDataURL(file);
  }
  private previewPdf(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const message: any = {
        text: '',
        senderUserType: 'tms_user',
        createdAt: new Date(),
        file: {
          name: file.name,
          url: e.target.result,
          type: file.type,
          size: file.size,
        },
      };
      this.fileUpload(file);
      this.scrollToBottom();
    };
    reader.readAsDataURL(file);
  }
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > this.maxFileSize) {
        alert('File size should not exceed 10MB');
        return;
      }

      const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
      if (allowedTypes.includes(file.type)) {
        this.previewFile(file);
      } else {
        alert('Please upload only PNG, JPEG, or PDF files.');
      }
    }
  }
  formatFileSize(size: number): string {
    if (!size) return '0 ' + this.translate.instant('CHAT.SIZE.KB');

    const units = ['BYTES', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(size) / Math.log(1024));
    const finalSize = Math.round(size / Math.pow(1024, i));

    return `${finalSize} ${this.translate.instant('CHAT.SIZE.' + units[i])}`;
  }
  private scrollToBottom(): void {
    setTimeout(() => {
      const element = this.scrollContainer?.nativeElement;
      element.scrollTop = element.scrollHeight;
    });
  }
  scrollToMessage(messageId: string) {
    setTimeout(() => {
      const messageElement = document.getElementById(messageId);
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        this.highlightedMessageId = messageId;
        setTimeout(() => {
          this.highlightedMessageId = null;
        }, 2000);
      }
    });
  }
  startDrag(event: MouseEvent) {
    this.isDragging = true;
    this.dragOffset.x = event.clientX - this.chatIconPosition.x;
    this.dragOffset.y = event.clientY - this.chatIconPosition.y;
  }
  formatMessageDate(date: Date): string {
    const today = new Date();
    const messageDate = new Date(date);

    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const messageDateOnly = new Date(
      messageDate.getFullYear(),
      messageDate.getMonth(),
      messageDate.getDate()
    );

    const diffTime = todayDate.getTime() - messageDateOnly.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return this.translate.instant('chat.TODAY');
    } else if (diffDays === 1) {
      return this.translate.instant('chat.YESTERDAY');
    } else {
      return messageDate.toLocaleDateString(this.translate.currentLang, {
        day: 'numeric',
        month: 'long',
      });
    }
  }
  shouldShowDateHeader(currentMessage: any, previousMessage: any): boolean {
    if (!previousMessage) return true;

    const currentDate = new Date(currentMessage.createdAt);
    const previousDate = new Date(previousMessage.createdAt);

    return !this.isSameDay(currentDate, previousDate);
  }
  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }
  onChatListScroll(event: any) {
    const element = event.target;
    const scrollPosition = Math.ceil(element.scrollTop + element.clientHeight);
    const totalHeight = element.scrollHeight;
    if (scrollPosition >= totalHeight - 50) {
      if (this.pageParams.pageIndex < this.pageParams.totalPagesCount) {
        this.loadMoreChats();
      }
    }
  }
  onScrollMessages(event: Event): void {
    const element = event.target as HTMLElement;
    if (element.scrollTop === 0) {
      if (this.messagesParams.pageIndex < this.totalPagesCount) {
        this.loadMoreMessages();
      }
    }
  }
  loadMoreChats() {
    if (this.loadingMore) return;
    this.loadingMore = true;
    this.pageParams.pageIndex++;
    let query = generateQueryFilter(this.pageParams)
    this.serviceApi.getDriverServices(query).subscribe({
      next: (res: any) => {
        if (res?.data?.content?.length) {
          this.chats = [...this.chats, ...res.data.content];
          this.pageParams.totalPagesCount = parseInt(res.data.totalPagesCount) || 1;
        }
      },
      error: (error) => {
      },
      complete: () => {
        this.loadingMore = false;
      }
    });
  }
  loadMoreMessages() {
    if (this.loadingMore) return;
    this.loadingMore = true;

    const container = document.querySelector('.chat-messages') as HTMLElement;
    const previousScrollHeight = container ? container.scrollHeight : 0;

    this.messagesParams.pageIndex++;
    this.serviceApi.getChatMessages(this.selectedChat.id, generateQueryFilter(this.messagesParams)).subscribe({
      next: (res: any) => {
        if (res?.data?.content?.length) {
          this.messages = [...res.data.content.sort((a, b) => a.id - b.id), ...this.messages];
          this.groupMessagesByDate();

          if (container) {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = newScrollHeight - previousScrollHeight;
          }
        }
      },
      error: (error) => { },
      complete: () => {
        this.loadingMore = false;
      }
    });
  }


  closeChat() {
    this.closeChatEvent.emit();
  }
  private groupMessagesByDate() {
    this.groupedMessages = {};
    this.messages.forEach((message, index) => {
      const dateKey = this.formatDateKey(new Date(message.createdAt));
      if (!this.groupedMessages[dateKey]) {
        this.groupedMessages[dateKey] = [];
      }

      this.groupedMessages[dateKey].push(message);
    });
  }
  private formatDateKey(date: Date): string {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (this.isSameDay(date, today)) {
      return this.translate.instant('chat.TODAY');
    } else if (this.isSameDay(date, yesterday)) {
      return this.translate.instant('chat.YESTERDAY');
    } else {
      return date.toLocaleDateString(this.translate.currentLang, { day: 'numeric', month: 'short', year: 'numeric' });
    }
  }
  getDateKeys(): string[] {
    return Object.keys(this.groupedMessages);
  }
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      const deltaX =
        (event.clientX - this.dragOffset.x - this.chatIconPosition.x) *
        this.dragSpeedFactor;
      const deltaY =
        (event.clientY - this.dragOffset.y - this.chatIconPosition.y) *
        this.dragSpeedFactor;
      this.chatIconPosition.x += deltaX;
      this.chatIconPosition.y += deltaY;
      localStorage.setItem('chatPosition', JSON.stringify(this.chatIconPosition));
    }
  }
  @HostListener('document:mouseup')
  onMouseUp() {
    this.isDragging = false;
  }
  @HostListener('window:keydown.escape')
  onEscapePress() {
    this.closeChat();
  }
}