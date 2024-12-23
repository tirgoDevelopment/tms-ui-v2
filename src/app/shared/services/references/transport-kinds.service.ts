import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { env } from 'src/environmens/environment';
import { Response } from '../../models/reponse';

@Injectable({
  providedIn: 'root'
})
export class TransportKindsService {

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get(env.references + '/references/transport-kinds/all')
  }
  create(data: any) {
    return this.http.post>(env.references + '/references/transport-kinds', data)
  }
  update(data: any) {
    return this.http.put(env.references + '/references/transport-kinds', data)
  }
  delete(id: number | string) { 
    return this.http.delete(env.references + `/references/transport-kinds?id=${id}`)
  }
}