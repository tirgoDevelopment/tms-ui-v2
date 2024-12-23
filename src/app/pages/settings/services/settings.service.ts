import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { env } from "src/environmens/environment";

@Injectable({ providedIn: 'root' })

export class SettingService {
  constructor(
    private http: HttpClient
  ) { }

  changePassword(data:any) {
    return this.http.patch(env.apiUrl + '/users/driver-merchant-user/password?userId='+data.userId, data)
  }
}