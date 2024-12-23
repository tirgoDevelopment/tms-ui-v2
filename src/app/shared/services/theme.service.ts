// src/app/services/theme.service.ts
import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  colorTheme: string = 'light-mode' || 'dark-mode';

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.initTheme();
  }

  initTheme() {
    this.colorTheme = localStorage.getItem('user-theme') || 'light-mode';
    this.renderer.addClass(document.body, this.colorTheme);
  }

  setTheme(theme: 'light-mode' | 'dark-mode') {
    this.renderer.removeClass(document.body, this.colorTheme);
    this.colorTheme = theme;
    this.renderer.addClass(document.body, theme);
    localStorage.setItem('user-theme', theme);
  }
}
