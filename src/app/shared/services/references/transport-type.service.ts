import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { env } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class TransportTypesService {

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get(env.references + '/transport-types')
  }
  create(data: any) {
    return this.http.post(env.references + '/transport-types', data)
  }
  update(data: any) {
    return this.http.put(env.references + '/transport-types', data)
  }
  delete(id: number | string) { 
    return this.http.delete(env.references + `/transport-types?id=${id}`)
  }
}