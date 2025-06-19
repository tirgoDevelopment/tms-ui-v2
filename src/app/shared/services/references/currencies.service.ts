import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Response } from "../../models/reponse";
import { env } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class CurrenciesService {

    constructor(private http: HttpClient) { }

    getAll(params?: any) {
        return this.http.get(env.references + '/currencies')
    }
} 