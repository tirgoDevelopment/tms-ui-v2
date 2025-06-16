import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { env } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class GSMService {

    constructor(private http: HttpClient) { }

    postGSMCardNumber(data) {
        return this.http.post(`${env.apiUrl}/${data.id}/gcm/set-card-number`, data);
    }
    topUpTmsGSMBalance(data) {
        return this.http.post(`${env.apiUrl}/drivers/${data.driverId}/gcm-balances/assign-request`, data);
    }
    getTmsGSMTransactions(filter) {
        return this.http.get(`${env.apiUrl}/finances/gcm-transactions?` + filter);
    }
}