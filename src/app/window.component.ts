import { Component, Input } from '@angular/core';
import { Window } from './window';

@Component({
  selector: 'window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.css']
})
export class WindowComponent {
  @Input()
  window: Window;
}
