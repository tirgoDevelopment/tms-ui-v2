import { HttpClient } from '@angular/common/http';
import { Injectable, forwardRef,Inject } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { NgxPermissionsService } from 'ngx-permissions';
import { Observable, of, switchMap, throwError } from 'rxjs';
import { env } from 'src/environmens/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isAuthenticated = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private permissionService: NgxPermissionsService) { }

  set accessToken(token: string) {
    localStorage.setItem('accessTokenTms', token);
  }

  get accessToken(): string {
    return localStorage.getItem('accessTokenTms') ?? '';
  }

  signIn(credentials: { username: string; password: string,userType:string }): Observable<any> {
    if (this.isAuthenticated) {
      return throwError('User is already logged in.');
    }
    return this.http.post(`${env.apiUrl}/users/login`, credentials).pipe(
      switchMap((response: any) => {
        this.accessToken = response.data.token;
        let user: any;
        user = this.accessToken ? jwtDecode(this.accessToken) : null;
        this.isAuthenticated = true;
        // let allPermission = user?.role?.permission ? this.checkPermissions(user?.role?.permission) : [];
        // this.permissionService.loadPermissions(allPermission);
        this.isAuthenticated = true;
        return of(response);
      }),
    );
  }

  logout(): void {
    this.isAuthenticated = false;
    localStorage.clear();
    // this.router.navigate(['/auth/sign-in']);
  }

  checkPermissions(permissions: any) {
    const keysToCheck = [
      'addDriver',
      'addClient',
      'addOrder',
      'cancelOrder',
      'seeDriversInfo',
      'seeClientsInfo',
      'sendPush',
      'chat',
      'tracking',
      'driverFinance',
      'clientMerchantFinance',
      'driverMerchantFinance',
      'registerClientMerchant',
      'registerDriverMerchant',
      'verifyDriver',
      'clientMerchantList',
      'driverMerchantList',
      'adminPage',
      'finRequest',
      'driverMerchantPage',
      'clientMerchantPage',
      'driverVerification',
      'agentPage',
      'dashboardPage',
      'archivedPage',
      'orderPage',
      'referencesPage',
      'activePage',
      'adminAgentPage',
      'attachDriverAgent',
      'addBalanceAgent',
      'seeSubscriptionTransactionAgent',
      'seePaymentTransactionAdmin',
      'seeServiceTransactionAdmin'
    ];
    let result = keysToCheck.filter(key => permissions[key]);
    return result
  }

  signOut(): void {
    localStorage.removeItem('accessTokenTms');
    this.isAuthenticated = false;
    this.navigateAway();
  }
  private navigateAway(): void {
    this.router.navigate(['/auth/sign-in']);
  }
  check(): Observable<boolean> {
    if (this.accessToken) {
      return of(true);
    }
    if  (this.isAuthenticated) {
      return of(true);
    }
    else {
      return of(false);
    }
  }

  verifyPhone(data:any) {
    return this.http.post(env.apiUrl + '/users/driver-merchant-user/phone-verify', data);
  }
  merchantCreate(data:any) {
    return this.http.post(env.apiUrl + '/users/driver-merchants/register', data);
  }
  getMerchantById(id:string | number) {
    return this.http.get(env.apiUrl + '/users/driver-merchants/driver-merchant-by?id=' + id);
  }
  merchantUpdate(data:any) {
    return this.http.post(env.apiUrl + '/users/driver-merchants/register/step', data);
  }
  merchantComplete(data:any) {
    return this.http.post(env.apiUrl + '/users/driver-merchants/register/complete', data);
  }
}