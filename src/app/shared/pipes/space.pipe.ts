import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'spaceSeparator' })
export class SpaceSeparatorPipe implements PipeTransform {
  transform(value: number | null | undefined, decimals: number = 2): string {
    if (value == null) {
      return '';
    }
    return value
      .toFixed(decimals)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
}
