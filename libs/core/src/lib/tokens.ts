import { InjectionToken } from '@angular/core';
import { MaskPatterns, StringMaskOptions } from './mask';

export const NGX_MASK_OPTIONS = new InjectionToken<Partial<StringMaskOptions>>('NGX_MASK_OPTIONS', {
  providedIn: 'root',
  factory() {
    return {
      tokens: {
        '0': { pattern: MaskPatterns.number, default: '0' },
        '9': { pattern: MaskPatterns.number, optional: true },
        'A': { pattern: '[a-zA-Z0-9]' },
        'S': { pattern: '[a-zA-Z]' },
        'U': {
          pattern: '[a-zA-Z]',
          transform: (c: string) => c.toLocaleUpperCase()
        },
        'L': {
          pattern: '[a-zA-Z]',
          transform: (c: string) => c.toLocaleLowerCase()
        },
        '$': { escape: true }
      }
    };
  }
});
