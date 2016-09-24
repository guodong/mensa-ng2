import { Component, ElementRef } from '@angular/core';

@Component({
  selector: 'startmenu',
  templateUrl: './startmenu.component.html',
  styleUrls: ['./startmenu.component.css'],
  host: {
    '(document:click)': 'onClick($event)',
  },
})
export class StartmenuComponent {
  active: boolean;
  constructor(private _eref: ElementRef) {}

  onStartClick() {
    this.active = !this.active;
  }

  onClick(event: any) {
    if (!this._eref.nativeElement.contains(event.target)){
      this.active = false;
    }

  }
}
