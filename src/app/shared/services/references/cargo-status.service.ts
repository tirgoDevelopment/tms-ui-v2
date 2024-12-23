import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { env } from 'src/environmens/environment';
import { Response } from '../../models/reponse';
import { CargoStatusModel } from 'src/app/pages/references/cargo-status/models/cargo-status.model';

@Injectable({
  providedIn: 'root'
})
export class CargoStatusService {

  constructor(private http: HttpClient) { }

  getAll(params?: any): Observable<Response<CargoStatusModel[]>> {
    return this.http.get<Response<CargoStatusModel[]>>(env.references + `/references/cargo-statuses/all?pageIndex=${params?.pageIndex}&pageSize=${params?.pageSize}&totalPagesCount=${params?.totalPagesCount}&sortBy=${params?.sortBy}&sortType=${params?.sortType}`)
  }
  create(data: CargoStatusModel) {
    return this.http.post<Response<CargoStatusModel[]>>(env.references + '/references/cargo-statuses', data)
  }
  update(data: CargoStatusModel) {
    return this.http.put<Response<CargoStatusModel[]>>(env.references + '/references/cargo-statuses', data)
  }
  delete(id: number | string) { 
    return this.http.delete(env.references + `/references/cargo-statuses?id=${id}`)
  }
}