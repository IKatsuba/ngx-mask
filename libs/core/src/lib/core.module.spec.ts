import { async, TestBed } from '@angular/core/testing';
import { NgxMaskCoreModule } from './core.module';

describe('CoreModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgxMaskCoreModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(NgxMaskCoreModule).toBeDefined();
  });
});
