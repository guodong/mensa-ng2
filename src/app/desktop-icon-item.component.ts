import { Component, Input } from '@angular/core';
import {App} from './app';
import {ProcessManagerService} from './process-manager.service';

@Component({
  selector: 'desktop-icon-item',
  templateUrl: './desktop-icon-item.component.html',
  styleUrls: ['./desktop-icon-item.component.css']
})
export class DesktopIconItemComponent {
  @Input()
  app: App;
  
  constructor(private processManagerService: ProcessManagerService) {}

  dblClick() {
    this.processManagerService.run(this.app);
  }
}
