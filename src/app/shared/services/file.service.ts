import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { env } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileUrlService {

  constructor(private http: HttpClient) { }

  getFileUrl(keyName: string, fileName: string): Observable<any> {
    return this.http.get(env.references + `/files/${keyName}/${fileName}`, { responseType: 'blob' })
      .pipe(
        map((blob: Blob) => {
          return URL.createObjectURL(blob);
        })
      );
  }

  getFileBlob(keyName: string, fileName: string): Observable<Blob> {
    return this.http.get(env.references + `/files?keyName=${keyName}&fileName=${fileName}`, { responseType: 'blob' });
  }

  downloadImage(keyName: string, fileName: string) {
    return this.http.get(env.references + `/files/${keyName}/${fileName}`, { responseType: 'blob' }).subscribe(blob => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = Date.now() + '.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, error => {
    });
  }

}
