import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'priceFormat'
})
export class PriceFormatPipe implements PipeTransform {

  transform(value: number | string): string {
    if (value == null || value === '') return '';
    const numValue = typeof value === 'string' ? Number(value) : value;
    if (isNaN(numValue)) return value.toString();
    const truncatedValue = Math.floor(numValue * 100) / 100;
    return truncatedValue
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
}
