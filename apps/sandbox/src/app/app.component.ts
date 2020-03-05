import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'ngx-mask-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  control = new FormControl('123');

  constructor() {
    this.control.valueChanges.subscribe(console.log);
  }
}
