import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { env } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class CompanyTypesService {
    constructor(private http: HttpClient) { }

    getAll(params?) {
        return this.http.get(env.references + `/company-types`)
    }
}