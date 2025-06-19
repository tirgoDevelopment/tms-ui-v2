import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { env } from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})
export class TransportBrandService {

  constructor(private http: HttpClient) { }
  // Brand Transport
  getBrandGroups() {
    return this.http.get(env.adminUrl + '/references/transport-brand-groups')
  }
  getBrandGroupsById(id) {
    return this.http.get(env.adminUrl + '/references/transport-brand-groups/' + id)
  }
  postBrandGroups(data) {
    return this.http.post(env.adminUrl + '/references/transport-brand-groups', data)
  }
  putBrandGroups(data) {
    return this.http.put(env.adminUrl + '/references/transport-brand-groups', data)
  }
  deleteBrandGroups(id) {
    return this.http.delete(env.adminUrl + '/references/transport-brand-groups', id)
  }

  // Model Transport
  getModels() {
    return this.http.get(env.adminUrl + '/references/transport-brands')
  }
  getModelsById(id) {
    return this.http.get(env.adminUrl + '/references/transport-brands/' + id)
  }
  postModels(data) {
    return this.http.post(env.adminUrl + '/references/transport-brands', data)
  }
  putModels(data) {
    return this.http.put(env.adminUrl + '/references/transport-brands', data)
  }
  deleteModels(id) {
    return this.http.delete(env.adminUrl + '/references/transport-brands', id)
  }

}