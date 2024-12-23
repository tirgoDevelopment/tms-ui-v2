import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileFormat'
})
export class FileFormatPipe implements PipeTransform {

  transform(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension)) {
      return 'image';
    } else if (extension === 'pdf') {
      return 'pdf';
    } else {
      return 'unknown'; // Yana boshqa formatlar uchun
    }
  }
}
