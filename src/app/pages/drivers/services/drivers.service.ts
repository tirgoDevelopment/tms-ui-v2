import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { env } from 'src/environmens/environment';
import { Response } from 'src/app/shared/models/reponse';
import { DriverModel } from '../models/driver.model';
import { generateQueryFilter } from 'src/app/shared/pipes/queryFIlter';

@Injectable({
  providedIn: 'root'
})
export class DriversService {

  constructor(private http: HttpClient) { }

  getAllTmsDrivers(merchantId?: any, params?: any, filter?: any): Observable<Response<DriverModel[]>> {
    return this.http.get<Response<DriverModel[]>>(`${env.apiUrl}/drivers/accounts?${filter}`, { params })
  }
  getAllDrivers(filter?: any): Observable<Response<DriverModel[]>> {
    return this.http.get<Response<DriverModel[]>>(`${env.adminUrl}/drivers?${filter}`)
  }
  getById(id: any): Observable<Response<DriverModel>> {
    return this.http.get<Response<DriverModel>>(`${env.apiUrl}/drivers/accounts/` + id)
  }
  create(data: FormData) {
    return this.http.post<Response<DriverModel[]>>(env.apiUrl + '/drivers/accounts', data)
  }
  update(id: any, data: FormData) {
    return this.http.put<Response<DriverModel[]>>(env.apiUrl + '/drivers/accounts/' + id, data)
  }

  delete(id: number | string) {
    return this.http.delete(env.apiUrl + `/drivers?id=${id}`)
  }
  block(id: number | string) {
    return this.http.patch<Response<DriverModel>>(env.apiUrl + `/drivers/block-driver?id=${id}`, {})
  }
  unblock(id: number | string) {
    return this.http.patch<Response<DriverModel>>(env.apiUrl + `/drivers/unblock-driver?id=${id}`, {})
  }

  sendRequestToAddDriver(data: any) {
    return this.http.post<Response<any>>(env.apiUrl + `/drivers/${data.driverId}/assign-request`, data)
  }
  unAssignDriver(driverId: any) {
    return this.http.post<Response<any>>(env.apiUrl + `/drivers/unassign-driver/${driverId}`, {})
  }
  topupDriverBalance(data: any) {
    return this.http.post<Response<DriverModel>>(env.apiUrl + `/drivers/${data.driverId}/balances`, data)
  }
  findDrivers(merchantId, searchTerm: string, searchAs: string) {
    const filter = generateQueryFilter({ [searchAs]: searchTerm });
    return this.getAllTmsDrivers(merchantId, {}, filter).pipe(
      catchError(() => of({ data: { content: [] } }))
    );
  }
  sendOtp(data: any) {
    return this.http.post(env.apiUrl + `/send-otp/additional-phone`, data)
  }


  getTransport(driverId: number | string, transportId: number | string): Observable<Response<any[]>> {
    return this.http.get<Response<any[]>>(env.apiUrl + `/drivers/${driverId}/transports/${transportId}`)
  }
  updateTransport(data: any) {
    return this.http.put<Response<any[]>>(env.apiUrl + `/drivers/${data.driverId}/transports/${data.id}`, data)
  }
  createTransport(data: any) {
    return this.http.post<Response<any[]>>(env.apiUrl + `/drivers/transports`, data)
  }
  deleteTransport(driverId: number | string, transportId: number | string) {
    return this.http.delete<Response<any>>(env.apiUrl + `/drivers/transports/${transportId}`)
  }


}