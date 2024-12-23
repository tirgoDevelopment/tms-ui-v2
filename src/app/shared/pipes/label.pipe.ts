import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'label'
})
export class LabelPipe implements PipeTransform {
  transform(driver: any, searchAs: string): string {
    switch (searchAs) {
      case 'driverId':
        return driver.id + ' (' + driver.firstName + ' ' + driver.lastName.substring(0, 1) + '.)';
      case 'phoneNumber':
        return '+' +driver.phoneNumbers[0].code + driver.phoneNumbers[0].number + ' (' + driver.firstName + ' ' + driver.lastName.substring(0, 1) + '.)'; 
      case 'transportNumber':
        return driver.driverTransports[0].transportNumber + ' (' + driver.firstName + ' ' + driver.lastName.substring(0, 1) + '.)';
      default:
        return driver.firstName + ' ' + driver.lastName;
    }
  }
}
