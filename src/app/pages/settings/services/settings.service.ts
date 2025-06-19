import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { env } from "src/environments/environment";

@Injectable({ providedIn: 'root' })

export class SettingService {
  constructor(
    private http: HttpClient
  ) { }

  changePassword(data:any) {
    return this.http.patch(env.adminUrl + '/tmses/users/password?userId='+data.userId, data)
  }
}