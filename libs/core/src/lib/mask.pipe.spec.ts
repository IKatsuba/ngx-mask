import { NgxMaskPipe } from './mask.pipe';
import { NgxMaskService } from '@ngx-mask/core';
import { TestBed } from '@angular/core/testing';

describe('NgxMaskPipe', () => {
  let service: NgxMaskService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxMaskService);
  });

  it('create an instance', () => {
    const pipe = new NgxMaskPipe(service);
    expect(pipe).toBeTruthy();
  });

  it('should mask a value', () => {
    const pipe = new NgxMaskPipe(service);
    const mask = '0000 0000 0000 0000';
    const value = '1231 2312 31231234';
    const result = '1231 2312 3123 1234';
    expect(pipe.transform(value, mask)).toEqual(result);
  });
});
