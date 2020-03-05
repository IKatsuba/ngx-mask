import { TestBed } from '@angular/core/testing';

import { NgxMaskService } from './mask.service';

describe('NgxMaskService', () => {
  let service: NgxMaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxMaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should mask a value', () => {
    expect(service.applyMask('1ksx99', '00')).toEqual('19');

    expect(service.applyMask('1231 231231231234', '0000 0000 0000 0000'))
      .toEqual('1231 2312 3123 1234');
  });
});
