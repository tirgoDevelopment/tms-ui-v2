import { NgModule } from '@angular/core';
import { CommonModule, NgIf, NgFor, NgStyle, NgClass } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    NgIf,
    NgFor,
    NgStyle,
    NgClass
  ],
  exports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    NgIf,
    NgFor,
    NgStyle,
    NgClass
  ]
})
export class CommonModules {}
