import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, of } from "rxjs";
import { generateQueryFilter } from "src/app/shared/pipes/queryFIlter";
import { env } from "src/environments/environment";

@Injectable({
    providedIn: 'root',
  })
  export class TransportsService { 
    constructor(private http: HttpClient) {}
    
    getAll(filter: any) {
      return this.http.get(`${env.apiUrl}/drivers/transports?${filter}`);
    }
    getById(id) {
      return this.http.get(`${env.apiUrl}/drivers/transports/${id}`);
    }
    getTransportHistory(query) {
      return this.http.get(`${env.apiUrl}/drivers/transports/operations/histories`+query);
    }
    postTransport(data) {
      return this.http.post(`${env.apiUrl}/drivers/transports`, data);
    }
    putTransport(data) {
      return this.http.put(`${env.apiUrl}/drivers/transports/${data.id}`, data);
    }
    deleteTransport(id) {
      return this.http.delete(`${env.apiUrl}/drivers/transports/${id}`);
    }
    assignToDriver(data) {
      return this.http.post(`${env.apiUrl}/drivers/${data.driverId}/transports/${data.transportId}/assign`, data);
    }
    unassignToDriver(data) {
      return this.http.post(`${env.apiUrl}/drivers/${data.driverId}/transports/${data.transportId}/unassign`, data);
    }
    findTransport(searchTerm: string) {
      const filter = generateQueryFilter({ transportNumber: searchTerm });
      return this.getAll(filter).pipe(
        catchError(() => of({ data: { content: [] } }))
      );
    }
  }