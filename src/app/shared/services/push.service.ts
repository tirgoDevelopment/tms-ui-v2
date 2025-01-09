
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PushService { 

showPushNotification(title, message, type) {
    if ('Notification' in window) {
      const audio = new Audio(`assets/sound/notify-${type}.mp3`);
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: "assets/images/logo/auth-logo.svg",
        });
        audio.play();
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification(title, {
              body: message,
              icon: "assets/images/logo/auth-logo.svg",
            });
          }
        });
        audio.play();
      }
    } else {
      console.error('Brauzer Notification API ni qo‘llab-quvvatlamaydi.');
    }
  }
}
