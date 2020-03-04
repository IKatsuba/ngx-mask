import { InjectionToken } from '@angular/core';

export interface NgxMaskOptions {

}

export const NGX_MASK_OPTIONS = new InjectionToken<NgxMaskOptions>('NGX_MASK_OPTIONS', {
  providedIn: 'root',
  factory() {
    return {};
  }
});
