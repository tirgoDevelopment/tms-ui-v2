import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CargoGroupModel } from 'src/app/pages/references/cargo-type-groups/models/cargo-group.model';
import { env } from 'src/environmens/environment';
import { Response } from '../../models/reponse';

@Injectable({
  providedIn: 'root'
})
export class CargoTypeGroupsService {

  constructor(private http: HttpClient) { }

  getAll(params?: any): Observable<Response<CargoGroupModel[]>> {
    return this.http.get<Response<CargoGroupModel[]>>(env.references + `/references/cargo-type-groups/all?pageIndex=${params?.pageIndex}&pageSize=${params?.pageSize}&totalPagesCount=${params?.totalPagesCount}&sortBy=${params?.sortBy}&sortType=${params?.sortType}`)
  }
  create(data: CargoGroupModel) {
    return this.http.post<Response<CargoGroupModel[]>>(env.references + '/references/cargo-type-groups', data)
  }
  update(data: CargoGroupModel) {
    return this.http.put<Response<CargoGroupModel[]>>(env.references + '/references/cargo-type-groups', data)
  }
  delete(id: number | string) { 
    return this.http.delete(env.references + `/references/cargo-type-groups?id=${id}`)
  }
}