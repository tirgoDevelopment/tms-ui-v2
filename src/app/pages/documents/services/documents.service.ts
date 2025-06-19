import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { env } from 'src/environments/environment';
import { Response } from 'src/app/shared/models/reponse';
import { DocumentModel } from '../models/documents.model';
import { generateQueryFilter } from 'src/app/shared/pipes/queryFIlter';

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {

  constructor(private http: HttpClient) { }

  getDriversDocuments(params?: any, filter?: any): Observable<Response<DocumentModel[]>> {
    return this.http.get<Response<DocumentModel[]>>(`${env.apiUrl}/drivers/documents`)
  }
  getTransportsDocuments(params?: any, filter?: any): Observable<Response<DocumentModel[]>> {
    return this.http.get<Response<DocumentModel[]>>(`${env.apiUrl}/drivers/transports/documents/list`)
  }
}