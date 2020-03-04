import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NGX_MASK_OPTIONS, NgxMaskOptions } from './tokens';

@NgModule({
  imports: [CommonModule]
})
export class NgxMaskCoreModule {
  public static configure(options: NgxMaskOptions): ModuleWithProviders<NgxMaskCoreModule> {
    return {
      ngModule: NgxMaskCoreModule,
      providers: [
        {
          provide: NGX_MASK_OPTIONS,
          useValue: options
        }
      ]
    };
  }
}
