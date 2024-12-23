import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../services/notification.service';
import { AuthService } from 'src/app/pages/auth/services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const translate = inject(TranslateService);
  const toastr = inject(NotificationService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!navigator.onLine) {
        toastr.error('Интернет-связь отсутствует', 'Проверьте ваше подключение к интернету');
        return throwError(() => new Error('Интернет-связь отсутствует'));
      }

      if (error.error?.error === 'Not Found') {
        toastr.error('Not found', '');
        return throwError(() => new Error('Not found'));
      }

      const errorMessage = translate.instant(error.error?.message || '');
      if (error.error?.message === 'tokenExpired') {
        authService.logout();
      }

      const finalMessage = errorMessage || 'Извините, произошла ошибка';
      toastr.error( translate.instant(finalMessage), errorMessage ? '' : 'Попробуйте позже');
      
      return throwError(() => new Error(finalMessage));
    })
  );
};
