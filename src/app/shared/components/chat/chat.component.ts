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
import { CommonModules } from '../../modules/common.module';
import { IconsProviderModule } from '../../modules/icons-provider.module';
import { FormControl, FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzModules } from '../../modules/nz-modules.module';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { ServicesService } from 'src/app/pages/services/services/services.service';
import { debounceTime, distinctUntilChanged, map, Observable } from 'rxjs';
import { generateQueryFilter } from '../../pipes/queryFIlter';
import { SocketService } from '../../services/socket.service';
import { PipeModule } from '../../pipes/pipes.module';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NotificationService } from '../../services/notification.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  standalone: true,
  imports: [
    CommonModules,
    TranslateModule,
    IconsProviderModule,
    FormsModule,
    NzImageModule,
    NzSpaceModule,
    NzModules,
    NzPopconfirmModule,
    PipeModule
  ],
  providers: [NzModalService],
})
export class ChatComponent implements OnInit {
  searchControl = new FormControl();
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @ViewChild('messageInput') private messageInput!: ElementRef;
  @Output() closeChatEvent = new EventEmitter<void>();
  @Output() newMessageCountChange = new EventEmitter<number>();
  @Input() outputServiceId: string;

  chatIconPosition = {
    x: window.innerWidth - 400,
    y: window.innerHeight - window.innerHeight * 0.9,
  };
  private isDragging = false;
  private dragOffset = { x: 0, y: 0 };
  private dragSpeedFactor = 1;
  messages: any[] = [];
  currentUser;
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
  amountServiceTir = 0;
  private pageParams = {
    pageIndex: 1,
    pageSize: 10,
    totalPagesCount: 1,
    sortBy: '',
    sortType: '',
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
    private modal: NzModalService,
    private toastr: NotificationService
  ) {
    const currentLang = localStorage.getItem('lang') || 'us';
    this.translate.use(currentLang.toLowerCase());
  }

  ngOnInit() {
    this.currentUser = jwtDecode(localStorage.getItem('accessTokenTms'));
    console.log(this.currentUser);
    
    if (this.outputServiceId) {
      this.loading = true;
      this.serviceApi.getServiceRequestById(this.outputServiceId).subscribe((res: any) => {
        this.selectChat(res.data.data)
      })
    }
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((searchTerm) => {
        this.pageParams.serviceId = searchTerm;
        this.getChats();
      });
    this.getChats();
    this.sseSubscription = this.socketService.getSSEEvents().subscribe((event) => {
      if (event.event === 'newMessage') {
        let chat = this.chats.find(i => i.id == event.data.requestId);
        chat.unreadMessagesCount = chat.unreadMessagesCount + 1;
        if (this.selectedChat && (event.data.requestId == this.selectedChat.id) && (this.currentUser.userId != event.data.userId)) {
          this.messages.push(event.data.message);
        }
      }
    });

  }
  ngOnDestroy() {
    if (this.sseSubscription) {
      this.sseSubscription.unsubscribe();
    }
    this.socketService.disconnectSSE();
  }
  getChats() {
    this.loading = true;
    this.pageParams.pageIndex = 1;
    this.noMoreChats = false;
    let query = generateQueryFilter(this.pageParams);
    this.serviceApi.getDriverServices(query).subscribe({
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
    this.serviceApi.getChatMessages(this.selectedChat.id, generateQueryFilter(this.messagesParams)).subscribe({
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
  selectChat(chat: any) {
    this.selectedChat = chat;
    if (this.selectedChat && this.selectedChat.amountDetails) {
      this.amountServiceTir = this.selectedChat.amountDetails.reduce((sum, detail) => {
        return sum + Number(detail.amount);
      }, 0);
      this.patchUnreadCount();
      this.getChatMessages();
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
        senderUserType: "driver_merchant_user",
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
          this.messages.push(message);
          this.scrollToBottom();
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
  deleteMessage(messageToDelete: any) {
    this.selectedChat.messages = this.selectedChat.messages.filter(
      (message) => message.id !== messageToDelete.id
    );
    this.selectedChat.messages = this.selectedChat.messages.map((message) => {
      if (message.replyTo?.id === messageToDelete.id) {
        const { replyTo, ...messageWithoutReply } = message;
        return messageWithoutReply;
      }
      return message;
    });
    this.messages = this.selectedChat.messages;
  }
  deleteSelectedMessages() {
    const count = this.selectedMessages.size;
    this.selectedChat.messages = this.selectedChat.messages.filter(
      (message) => !this.selectedMessages.has(message.id)
    );
    this.exitSelectionMode();
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
        senderUserType: 'staff',
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
        senderUserType: 'staff',
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
          this.chats = [...res.data.content.sort((a, b) => a.id - b.id), ...this.chats];
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
  onCancelService() {
    this.modal.confirm({
      nzTitle: this.translate.instant('are_you_sure'),
      nzOkText: this.translate.instant('confirm'),
      nzCancelText: this.translate.instant('cancel'),
      nzOnOk: () => {
        this.serviceApi.patchServiceStatus({ id: this.selectedChat.id, status: 'cancel' }).subscribe((res: any) => {
          if (res && res.success) {
            this.selectedChat.status.code = 6;
            this.toastr.success(this.translate.instant('successfullyCanceled'), '');
          }
        });
      }
    });
  }
  onConfirmService() {
    this.serviceApi.patchServiceStatus({ id: this.selectedChat.id, status: 'confirm-price' }).subscribe((res: any) => {
      if (res && res.success) {
        this.selectedChat.status.code = 2;
        this.toastr.success(this.translate.instant('successfullUpdated'), '');
      }
    });
  }
}
