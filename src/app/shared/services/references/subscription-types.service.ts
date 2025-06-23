import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CargoTypesModel } from 'src/app/pages/references/cargo-types/models/cargo-type.model';
import { env } from 'src/environments/environment';
import { Response } from '../../models/reponse';
import { SubscriptionModel } from 'src/app/pages/references/subscription-type/models/subscription.model';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionTypesService {

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Response<SubscriptionModel[]>>(env.references + '/subscriptions/all')
  }
  create(data: SubscriptionModel) {
    return this.http.post<Response<SubscriptionModel[]>>(env.references + '/subscriptions', data)
  }
  update(data: SubscriptionModel) {
    return this.http.put<Response<SubscriptionModel[]>>(env.references + '/subscriptions', data)
  }
  delete(id: number | string) {
    return this.http.delete(env.references + `/subscriptions?id=${id}`)
  }
}