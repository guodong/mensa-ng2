import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { Window } from './window';
import { WmService } from './wm.service';

@Component({
  selector: 'desktop',
  templateUrl: './desktop.component.html',
  styleUrls: ['./desktop.component.css'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class DesktopComponent implements OnInit {
  @Input()
  windows: Window[];
  constructor(private wmService: WmService) {}

  ngOnInit(): void {
    this.wmService.getWindows().then(windows => this.windows = windows);
    // this.wmService.createWindow({
    //   x: '100',
    //   y: '100',
    //   width: '200',
    //   height: '200',
    //   title: 'abc',
    //   content: 'haha'
    // });
  }

}
