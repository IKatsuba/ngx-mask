import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NGX_MASK_OPTIONS } from './tokens';
import { NgxMaskPipe } from './mask.pipe';
import { NgxMaskDirective } from './mask.directive';
import { StringMaskOptions } from './mask';

@NgModule({
  imports: [CommonModule],
  exports: [
    NgxMaskDirective
  ],
  declarations: [NgxMaskPipe, NgxMaskDirective]
})
export class NgxMaskCoreModule {
  public static configure(options: Partial<StringMaskOptions>): ModuleWithProviders<NgxMaskCoreModule> {
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
