import { NgxMaskDirective } from './mask.directive';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

@Component({
  template: `
    <input #input ngxMask="" type="text">
  `
})
class TestComponent {
  @ViewChild('input', { static: true }) input: ElementRef<HTMLInputElement>;
  @ViewChild(NgxMaskDirective, { static: true }) directive: NgxMaskDirective;
  value: string;
}

describe('MaskDirective', () => {
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [NgxMaskDirective, TestComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
  }));

  it('should create an instance', async () => {
    const { directive } = fixture.componentInstance;
    expect(directive).toBeTruthy();
  });

  it('should create an instance', async () => {
    await fixture.whenRenderingDone();

    fixture.componentInstance.directive.mask = '000 000';
    fixture.componentInstance.directive.writeValue('1sx2sx3 ss1s23ss');
    expect(fixture.componentInstance.input.nativeElement.value).toEqual('123 123');

    fixture.componentInstance.directive.mask = '000000';
    expect(fixture.componentInstance.input.nativeElement.value).toEqual('123123');
  });
});
