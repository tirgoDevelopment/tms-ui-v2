import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {
  transform(value: Date, includeTime: boolean = true): string {
    const months = [
      "январь", "февраль", "март", "апрель", "май", "июнь",
      "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"
    ];

    const date = new Date(value);
    const day = date.getUTCDate();
    const monthIndex = date.getUTCMonth();
    const year = date.getUTCFullYear();
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');

    let formattedDate = `${day} ${months[monthIndex]} ${year}`;

    if (includeTime) {
      formattedDate += ` в ${hours}:${minutes}`;
    }

    return formattedDate;
  }
}
