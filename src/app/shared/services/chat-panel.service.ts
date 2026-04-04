import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ChatPanelState {
  isOpen: boolean;
  serviceId: string | null;
  chatId: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ChatPanelService {
  private readonly stateSubject = new BehaviorSubject<ChatPanelState>({
    isOpen: false,
    serviceId: null,
    chatId: null,
  });

  readonly state$ = this.stateSubject.asObservable();

  open(serviceId: string | null = null, chatId: string | null = null): void {
    this.stateSubject.next({
      isOpen: true,
      serviceId,
      chatId,
    });
  }

  close(): void {
    this.stateSubject.next({
      isOpen: false,
      serviceId: null,
      chatId: null,
    });
  }
}
