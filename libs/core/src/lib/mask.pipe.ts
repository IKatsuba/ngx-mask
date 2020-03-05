import { Pipe, PipeTransform } from '@angular/core';
import { NgxMaskService } from './mask.service';
import { StringMaskOptions } from './mask';

@Pipe({
  name: 'ngxMask'
})
export class NgxMaskPipe implements PipeTransform {
  constructor(private maskService: NgxMaskService) {
  }

  transform(value: string, mask: string, config?: Partial<StringMaskOptions>): string {
    return this.maskService.applyMask(value, mask, config);
  }
}
