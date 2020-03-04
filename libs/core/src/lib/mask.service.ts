import { Inject, Injectable } from '@angular/core';
import { NGX_MASK_OPTIONS, NgxMaskOptions } from './tokens';

@Injectable({
  providedIn: 'root'
})
export class MaskService {
  constructor(@Inject(NGX_MASK_OPTIONS) private options: NgxMaskOptions) {
  }

  public applyMask(value: string, mask: string): string;
  public applyMask(value: string, mask: string, options: { cursor: number }): { value: string, cursor: number };
  public applyMask(value: string, mask: string, options?: { cursor: number }): any {

  }
}
