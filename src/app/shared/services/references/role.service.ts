import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { env } from 'src/environments/environment';
import { Response } from '../../models/reponse';
import { RoleModel } from '../../models/role.model';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<Response<RoleModel[]>>(env.references + '/roles/all-roles')
  }
  create(data: RoleModel) {
    return this.http.post<Response<RoleModel[]>>(env.references + '/roles', data)
  }
  update(data: RoleModel) {
    return this.http.put<Response<RoleModel[]>>(env.references + '/roles', data)
  }
  delete(id: number | string) { 
    return this.http.delete(env.references + `/roles?id=${id}`)
  }
}