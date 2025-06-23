import { Pipe, PipeTransform } from '@angular/core';
import { Observable, map } from 'rxjs';
import { FileUrlService } from '../services/file.service';
import { HttpClient } from '@angular/common/http';
import { env } from 'src/environments/environment';

@Pipe({
  name: 'fileFetch'
})
export class FileFetchPipe implements PipeTransform {

  constructor(private http: HttpClient) { }

  transform(fileName: string | ArrayBuffer | null, keyName: string): Observable<string> | null {
    if (!fileName || typeof fileName === 'object') {
      return null;
    }
    return this.http.get(env.references + `/files?keyName=${keyName}&fileName=${fileName}`, { responseType: 'blob' })
      .pipe(
        map((blob: Blob) => URL.createObjectURL(blob))
      );
  }

}
