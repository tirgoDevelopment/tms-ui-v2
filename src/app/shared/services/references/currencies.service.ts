import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Response } from "../../models/reponse";
import { env } from "src/environmens/environment";

@Injectable({
    providedIn: 'root'
})
export class CurrenciesService {

    constructor(private http: HttpClient) { }

    getAll(params?: any) {
        return this.http.get(env.references + '/references/currencies/all')
    }
    create(data: any) {
        return this.http.post(env.references + '/references/currencies', data)
    }
    update(data: any) {
        return this.http.put(env.references + '/references/currencies', data)
    }
    delete(id: number | string) {
        return this.http.delete(env.references + `/references/currencies?id=${id}`)
    }

} 