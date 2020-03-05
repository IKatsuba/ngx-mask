import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Optional,
  Output,
  Renderer2
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { NgxMaskService } from './mask.service';
import { BACKSPACE } from '@angular/cdk/keycodes';
import { timer } from 'rxjs';

@Directive({
  selector: 'input[ngxMask][type=text]'
})
export class NgxMaskDirective implements ControlValueAccessor, AfterViewInit {
  @Output()
  public valueChange = new EventEmitter<string>();
  private lastNativeValue: string;
  private isBackspaceChange: boolean;

  constructor(private maskService: NgxMaskService,
              private elementRef: ElementRef<HTMLInputElement>,
              private renderer: Renderer2,
              @Optional() private ngControl: NgControl) {
    if (ngControl) {
      ngControl.valueAccessor = this;
    }
  }

  @Input()
  get value(): string {
    return this.elementRef.nativeElement.value;
  }

  set value(value: string) {
    this.nativeValue = value;

    this._onInput();
  }

  private _mask = '';

  @Input('ngxMask')
  get mask(): string {
    return this._mask;
  }

  set mask(value: string) {
    this._mask = value;

    this._onInput();
  }

  private set nativeValue(value: string) {
    this.lastNativeValue = value;
    this.elementRef.nativeElement.value = value;
    this.valueChange.emit(value);
  }

  private get input(): HTMLInputElement {
    return this.elementRef.nativeElement;
  }

  private static indexOfFirstDifferentChar(value: string, diff: string = ''): number {
    let index: number;
    for (let i = 0; i < diff.length && i < value.length; i++) {
      if (value.charAt(i) !== diff.charAt(i)) {
        index = i;
        break;
      }
    }

    return index ?? value.length;
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    isDisabled
      ? this.renderer.setAttribute(this.elementRef, 'disabled', 'disabled')
      : this.renderer.removeAttribute(this.elementRef, 'disabled');
  }

  public writeValue(obj: any): void {
    this.value = obj;

    this._onInput();
  }

  @HostListener('blur')
  public onBlur() {
    this.onTouched();
  }

  @HostListener('keydown', ['$event'])
  _onKeydown(event: KeyboardEvent) {
    const { selectionStart, selectionEnd } = this.input;
    this.isBackspaceChange = event.keyCode === BACKSPACE && selectionEnd === selectionStart;
  }

  @HostListener('change')
  @HostListener('input')
  _onInput({ emitChange = true } = {}) {
    const { value, selectionStart } = this.input;

    const maskedValue = this.maskService.applyMask(value, this.mask);

    const indexOfFirstDifferentChar = this.lastNativeValue
      ? NgxMaskDirective.indexOfFirstDifferentChar(maskedValue, this.lastNativeValue)
      : maskedValue.length;

    this.nativeValue = maskedValue;
    this.input.selectionStart = this.input.selectionEnd = this.isBackspaceChange
      ? selectionStart
      : indexOfFirstDifferentChar + 1;
    this.isBackspaceChange = false;

    if (emitChange) {
      this.onChange(this.value);
    }
  }

  public ngAfterViewInit(): void {
    if (this.ngControl && this.ngControl.value !== this.value) {
      timer(0).subscribe(() => this.onChange(this.value));
    }
  }

  private onChange = (_) => {
  };

  private onTouched = () => {
  };
}
