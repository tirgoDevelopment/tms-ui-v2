import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'createdAt'
})
export class CreatedAtPipe implements PipeTransform {
  transform(
    statusesHistory: { status: { code: number }, createdAt: string }[],
    statusCode: number
  ): string | null {
    if (!statusesHistory || !Array.isArray(statusesHistory) || statusCode == null) {
      return null;
    }
    const foundItem = statusesHistory.find(item => item.status.code == statusCode);
    return foundItem ? foundItem.createdAt : null;
  }
}
