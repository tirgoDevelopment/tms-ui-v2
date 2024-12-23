import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneFormat'
})
export class PhoneFormatPipe implements PipeTransform {
  transform(phoneValue: string | number): string {
    if (typeof phoneValue === 'number') {
      phoneValue = phoneValue.toString();
    }
    // Remove non-numeric characters
    const cleaned = phoneValue.replace(/\D/g, '');

    // Apply formatting
    const match = cleaned.match(/^(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})$/);
    if (match) {
      return `+${match[1]} ${match[2]} ${match[3]} ${match[4]} ${match[5]}`;
    }

    return cleaned;
  }
}
