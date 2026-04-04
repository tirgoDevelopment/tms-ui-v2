import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;

  constructor() { }

  connect() {
    if (this.socket?.connected) {
      return;
    }

    const token = localStorage.getItem('accessToken') || '';
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
    return new Observable<any>((observer) => {
      if (!this.socket) {
        observer.error(new Error('Socket is not connected'));
        return () => { };
      }

      const eventHandler = (data: any) => {
        observer.next(data);
      };

      this.socket.on(eventName, eventHandler);

      return () => {
        this.socket?.off(eventName, eventHandler);
      };
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
