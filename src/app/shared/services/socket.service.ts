import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket!: Socket;
  private eventSubjects: { [key: string]: Subject<any> } = {};

  constructor() { }

  connect() {
    let token = localStorage.getItem('accessToken') || '';
    this.socket = io('https://test-admin.tirgo.io', { transports: ['websocket'], query: { token } });
    this.socket.on('connect', () => {
      console.log('✅ connect к сокету');
    });
  
    this.socket.on('unauthorized', (msg: any) => {
      console.error('❌ Unauthorized:', JSON.stringify(msg));
    });
  
    this.socket.on('connect_error', (error: any) => {
      console.error('❌ Socket connection error:', error);
    });
  }


  listen(eventName: string): Observable<any> {
    if (!this.eventSubjects[eventName]) {
      this.eventSubjects[eventName] = new Subject<any>();
      this.socket.on(eventName, (data: any) => {
        this.eventSubjects[eventName].next(data);
      });
    }
    return this.eventSubjects[eventName].asObservable();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
