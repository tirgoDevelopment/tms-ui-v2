import { env } from 'src/environments/environment';
import { ServiceModel } from '../models/service.model';
import { Observable } from 'rxjs';
import { Response } from 'src/app/shared/models/reponse';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ServicesService {
  private readonly baseStatusUrl = `${env.references}/services-requests-statuses`;
  private readonly baseRefUrl = `${env.references}/driver-services`;
  private readonly baseUrl = `${env.apiUrl}/services-requests`;
  private readonly chatUrl = `${env.apiUrl}/services-requests/chat`;

  constructor(private http: HttpClient) { }
  // REEFERENCES
  getServiceList(): Observable<Response<ServiceModel[]>> {
    return this.http.get<Response<ServiceModel[]>>(this.baseRefUrl);
  }

  getServiceById(id: number | string): Observable<Response<ServiceModel>> {
    return this.http.get<Response<ServiceModel>>(`${this.baseRefUrl}/${id}`);
  }

  // DRIVER SERVICES
  getDriverServices(params?: any) {
    return this.http.get(`${this.baseUrl}?${params}`);
  }
  getServicesByDriver(id: number | string) {
    return this.http.get(`${this.baseUrl}/drivers/${id}`);
  }
  postDriverServices(data: ServiceModel) {
    return this.http.post(`${this.baseUrl}`, data);
  }
  pricingService(data) {
    return this.http.patch(`${this.baseUrl}/${data.id}/price`, data)
  }
  patchServiceStatus(data) {
    return this.http.patch(`${this.baseUrl}/${data.id}/${data.status}`, data)
  }
  getServiceRequestById(id: number | string) {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  // Service Status
  getServiceStatus() {
    return this.http.get(`${this.baseStatusUrl}`);
  }
  postServiceStatus(data: any) {
    return this.http.post(`${this.baseStatusUrl}`, data);
  }
  putServiceStatus(data: any) {
    return this.http.put(`${this.baseStatusUrl}`, data);
  }
  deleteServiceStatus(id: any) {
    return this.http.delete(`${this.baseStatusUrl}?id=${id}`);
  }


  // SERVICE CHAT
  // getChatMessages(id: any, params) {
  //   return this.http.get(`${this.chatUrl}/${id}/messages?${params}`);
  // }
  // postChatMessages(id: any, data: any) {
  //   return this.http.post(`${this.chatUrl}/${id}/messages`, data);
  // }
  // postChatMessagesFiles(id: any, data: any) {
  //   return this.http.post(`${this.chatUrl}/${id}/messages/files`, data);
  // }
  // patchServiceCount(id) {
  //   return this.http.post(`${this.chatUrl}/${id}/messages/read`, {})
  // }

  getChatRooms(params) {
    return this.http.get(`${this.chatUrl}/rooms?${params}`);
  }
  getChatMessages(id: any, params?) {
    return this.http.get(`${this.chatUrl}/${id}/messages?${params}`);
  }
  postChatMessages(id: any, data: any) {
    return this.http.post(`${this.chatUrl}/${id}/messages`, data);
  }
  postChatMessagesFiles(id: any, data: any) {
    return this.http.post(`${this.chatUrl}/${id}/messages/files`, data);
  }
  patchServiceCount(id) {
    return this.http.post(`${this.chatUrl}/${id}/messages/read`, {})
  }

  tmsBalance(tmsId: any) {
    return this.http.get(`${env.apiUrl}/finances/balances`)
  }
  excelService(data) {
    return this.http.get(`${this.baseUrl}/excel/file?` + data, { responseType: 'blob' });
  }
}
