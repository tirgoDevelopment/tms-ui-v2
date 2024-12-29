import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhoneFormatPipe } from './phone-format.pipe';
import { FileFetchPipe } from './file-fetch.pipe';
import { DateFormatPipe } from './dateFormat.pipe';
import { PriceFormatPipe } from './priceFormat.pipe';
import { LabelPipe } from './label.pipe';
import { UppercaseValidationDirective } from './uppercase.directive';
import { FileFormatPipe } from './fileType.pipe';
import { CreatedAtPipe } from './createdAt.pipe';
import { CounterAnimationPipe } from './counter-animation.pipe';

@NgModule({
  declarations: [PhoneFormatPipe,FileFetchPipe, DateFormatPipe, PriceFormatPipe, LabelPipe,UppercaseValidationDirective,FileFormatPipe,CreatedAtPipe,CounterAnimationPipe],
  imports: [
    CommonModule
  ],
  exports: [PhoneFormatPipe,FileFetchPipe,DateFormatPipe, PriceFormatPipe, LabelPipe, UppercaseValidationDirective,FileFormatPipe,CreatedAtPipe,CounterAnimationPipe],
})
export class PipeModule { }
