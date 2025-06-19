import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { env } from 'src/environments/environment';
import { Response } from '../../models/reponse';

@Injectable({
  providedIn: 'root'
})
export class LoadingMethodService {

  constructor(private http: HttpClient) { }

  getAll(params?: any) {
    return this.http.get(env.references + `/cargo-loading-methodes`)
  }
  create(data: any) {
    return this.http.post(env.references + '/cargo-loading-methodes', data)
  }
  update(data: any) {
    return this.http.put(env.references + '/cargo-loading-methodes', data)
  }
  delete(id: number | string) { 
    return this.http.delete(env.references + `/cargo-loading-methodes?id=${id}`)
  }
}