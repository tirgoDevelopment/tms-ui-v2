import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SocketService } from './shared/services/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [RouterModule,TranslateModule]
})

export class AppComponent implements OnInit {
  sseSubscription
  constructor( 
    private translate: TranslateService,
    private socketService: SocketService) {  }
  ngOnInit(): void { 
    if(localStorage.getItem('lang') == null){
      localStorage.setItem('lang', 'RU')
    }
    this.translate.setDefaultLang('ru');
    const token = localStorage.getItem('accessTokenTms') || '';
    if (token) {
      this.socketService.connect();
    } else {
    }
    setTimeout(() => {
      const splashScreen = document.getElementById('splash-screen');
      if (splashScreen) {
        splashScreen.style.display = 'none';
      }  
    },100)
    
  }
  
}
