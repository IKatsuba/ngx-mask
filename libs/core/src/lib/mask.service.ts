import { Inject, Injectable } from '@angular/core';
import { NGX_MASK_OPTIONS } from './tokens';
import { Mask, StringMaskOptions } from './mask';

@Injectable({
  providedIn: 'root'
})
export class NgxMaskService {
  constructor(@Inject(NGX_MASK_OPTIONS) private options: StringMaskOptions) {
    this.validateTokens(options.tokens);
  }


  public applyMask(value: string, mask: string, options?: Partial<StringMaskOptions>): string {
    return Mask.applyMask(value, mask, { ...this.options, ...options });
  }

  public validateTokens(tokens: StringMaskOptions['tokens']): void | never {
    const token = Object.keys(tokens ?? {}).find(key => key.length !== 1);
    if (token) {
      throw new Error(`Token length must be 1! Actual token '${token}'`);
    }
  }
}
