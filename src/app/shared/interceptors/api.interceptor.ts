import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, Observable, switchMap, throwError, timeout } from 'rxjs';
import { AuthService } from 'src/app/pages/auth/services/auth.service';

let isRefreshing = false;
let refreshTokenSubject: Observable<any> | null = null;

export const authInterceptor = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthService);

    let newReq = req.clone();

    if (authService.accessToken) {
        newReq = req.clone({
            headers: req.headers.set('Authorization', 'Bearer ' + authService.accessToken),
        });
    }

    return next(newReq).pipe(
        timeout(50000),
        catchError((error) => {
            if (error instanceof HttpErrorResponse && error.status === 401) {
                if (!isRefreshing) {
                    isRefreshing = true;
                    refreshTokenSubject = authService.onRefreshToken().pipe(
                        switchMap((response: any) => {
                            isRefreshing = false;
                            if (response && response.success) {
                                authService.accessToken = response.data.accessToken;
                                authService.refreshToken = response.data.refreshToken;
                                localStorage.setItem('accessTokenTms', authService.accessToken);
                                localStorage.setItem('refreshTokenTms', authService.refreshToken);
                                return next(
                                    req.clone({
                                        headers: req.headers.set('Authorization', 'Bearer ' + authService.accessToken),
                                    })
                                );
                            }
                            if(response.error == "Token verification failed") {
                                console.log(response);
                                authService.logout();
                                return null;
                              } 
                            else {
                                authService.logout();
                                return throwError(() => new Error('Failed to refresh token'));
                            }
                        })
                    );
                }
                return refreshTokenSubject!;
            }
            return throwError(() => error);
        })
    );
};