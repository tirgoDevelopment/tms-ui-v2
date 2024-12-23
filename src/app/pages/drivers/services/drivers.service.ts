import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { env } from 'src/environmens/environment';
import { Response } from 'src/app/shared/models/reponse';
import { DriverModel } from '../models/driver.model';

@Injectable({
  providedIn: 'root'
})
export class DriversService {

  constructor(private http: HttpClient) { }

  getAll(merchantId?: any, params?: any, filter?: any): Observable<Response<DriverModel[]>> {
    return this.http.get<Response<DriverModel[]>>(`${env.apiUrl}/users/drivers/merchants/${merchantId}?${filter}`, { params})
  }
  getAllAdmin(filter?: any): Observable<Response<DriverModel[]>> {
    return this.http.get<Response<DriverModel[]>>(`${env.apiUrl}/users/drivers?${filter}`)
  }
  getById(id: any): Observable<Response<DriverModel>> {
    return this.http.get<Response<DriverModel>>(`${env.apiUrl}/users/drivers/` + id)
  }
  create(data: FormData) {
    return this.http.post<Response<DriverModel[]>>(env.apiUrl + '/users/drivers', data)
  }
  update(id: any, data: FormData) {
    return this.http.put<Response<DriverModel[]>>(env.apiUrl + '/users/drivers/' + id, data)
  }
  delete(id: number | string) {
    return this.http.delete(env.apiUrl + `/users/drivers?id=${id}`)
  }
  block(id: number | string) {
    return this.http.patch<Response<DriverModel>>(env.apiUrl + `/users/drivers/block-driver?id=${id}`, {})
  }
  unblock(id: number | string) {
    return this.http.patch<Response<DriverModel>>(env.apiUrl + `/users/drivers/unblock-driver?id=${id}`, {})
  }
  getTransport(driverId: number | string, transportId: number | string): Observable<Response<any[]>> {
    return this.http.get<Response<any[]>>(env.apiUrl + `/users/drivers/${driverId}/transports/${transportId}`)
  }
  updateTransport(data: any) {
    return this.http.put<Response<any[]>>(env.apiUrl + `/users/drivers/${data.driverId}/transports/${data.id}`, data)
  }
  createTransport(data: any) {
    return this.http.post<Response<any[]>>(env.apiUrl + `/users/drivers/${data.driverId}/transports`, data)
  }
  deleteTransport(driverId: number | string, transportId: number | string) {
    return this.http.delete<Response<any>>(env.apiUrl + `/users/drivers/${driverId}/transports/${transportId}`)
  }
  sendRequestToAddDriver(data: any) {
    return this.http.post<Response<any>>(env.apiUrl + `/users/driver-merchants/${data.tmsId}/request-driver/${data.driverId}`, data)
  }
  unAssignDriver(driverId: any) {
    return this.http.post<Response<any>>(env.apiUrl + `/users/driver-merchants/unassign-driver/${driverId}`, {})
  }
  topupDriverBalance(data: any) {
    return this.http.post<Response<DriverModel>>(env.apiUrl + `/users/drivers/${data.driverId}/balances`, data)
  }
}