import { Injectable } from '@angular/core';
import { env } from 'src/environmens/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RefService {

  constructor(
    private http: HttpClient,
  ) { }

  getCities(city:string,lang:string) {
    return this.http.get(env.references + '/references/cities?city='+city+'&lang='+lang);
  }


}