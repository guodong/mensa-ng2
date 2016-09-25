import {Component, Input} from '@angular/core';
import {Process} from './process';
import {Window} from './window';
import {ProcessManagerService} from './process-manager.service';
import {WmService} from './wm.service';

@Component({
  selector: 'taskbar-icon-item',
  templateUrl: './taskbar-icon-item.component.html',
  styleUrls: ['./taskbar-icon-item.component.css']
})
export class TaskbarIconItemComponent {
  @Input()
  process: Process;

  constructor(private pmService: ProcessManagerService, private wmService: WmService) {
  }

  unMinimize() {
    var me = this;
    this.pmService.activeProcess(this.process);
    this.process.windows.forEach((window: Window) => {
      window.unMinimize();
      me.wmService.activeWindow(window);
    });
  }
}
