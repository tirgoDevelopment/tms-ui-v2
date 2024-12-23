import { Directive, ElementRef, HostListener } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';
import { isValid } from 'date-fns';

@Directive({
  selector: '[appUppercaseValidation]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: UppercaseValidationDirective, multi: true }
  ]
})
export class UppercaseValidationDirective implements Validator {
  private internalValue: string = '';

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event']) onInput(event: Event) {
    const input = this.el.nativeElement as HTMLInputElement;
    this.internalValue = input.value.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 8);
    input.value = this.internalValue.toUpperCase();
    const control = (event.target as any).ngControl?.control;
    if (control) {
      control.setValue(this.internalValue, { emitEvent: false });
    }
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return null;
  }
}
