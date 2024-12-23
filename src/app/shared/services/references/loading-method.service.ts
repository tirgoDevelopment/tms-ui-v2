import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { env } from 'src/environmens/environment';
import { Response } from '../../models/reponse';

@Injectable({
  providedIn: 'root'
})
export class LoadingMethodService {

  constructor(private http: HttpClient) { }

  getAll(params?: any) {
    return this.http.get(env.references + `/references/cargo-loading-method/all?pageIndex=${params?.pageIndex}&pageSize=${params?.pageSize}&totalPagesCount=${params?.totalPagesCount}&sortBy=${params?.sortBy}&sortType=${params?.sortType}`)
  }
  create(data: any) {
    return this.http.post(env.references + '/references/cargo-loading-method', data)
  }
  update(data: any) {
    return this.http.put(env.references + '/references/cargo-loading-method', data)
  }
  delete(id: number | string) { 
    return this.http.delete(env.references + `/references/cargo-loading-method?id=${id}`)
  }
}