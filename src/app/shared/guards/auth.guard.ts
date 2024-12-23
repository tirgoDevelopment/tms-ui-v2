import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../../pages/auth/services/auth.service';
import { Observable, of, switchMap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.check().pipe(
      switchMap((authenticated) => {
        if (!authenticated) {
          const urlTree = this.router.parseUrl(`/auth/sign-in`);
          return of(urlTree);
        }
        else {
          let user:any = jwtDecode(localStorage.getItem('accessTokenTms'));
          if (!user.completed || (!user.verified && !user.rejected)) {
            this.router.navigate(['/auth/register']);
            return of(false);
          }        
        }
        return of(true);
      })
    );
  }
}
