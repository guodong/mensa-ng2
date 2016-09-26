import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { Window } from './window';
import { WmService } from './wm.service';
import {ProcessManagerService} from './process-manager.service';
import {App} from "./app";
import {RegistryService} from "./registry.service";

@Component({
  selector: 'desktop',
  templateUrl: './desktop.component.html',
  styleUrls: ['./desktop.component.css']
})
export class DesktopComponent implements OnInit {
  @Input()
  windows: Window[];
  
  apps: App[] = [];
  constructor(private wmService: WmService, private pmService: ProcessManagerService, private registryService: RegistryService) {}

  ngOnInit(): void {
    var me = this;
    this.wmService.getWindows().then(windows => this.windows = windows);
    this.apps = this.registryService.getApps();

    document.onmousemove = function (e: any) {
      var process = me.pmService.getActiveProcess();
      if (!process) {
        return;
      }
      process.worker.postMessage({
        msg: 'mousemove',
        payload: {
          id: 0,
          x: e.pageX,
          y: e.pageY
        }
      });
    };
    document.onmousedown = function (e: any) {
      var process = me.pmService.getActiveProcess();
      if (!process) {
        return;
      }
      process.worker.postMessage({
        msg: 'mousedown',
        payload: {
          code: e.which
        }
      });
    };
    document.onmouseup = function (e: any) {
      var process = me.pmService.getActiveProcess();
      if (!process) {
        return;
      }
      process.worker.postMessage({
        msg: 'mouseup',
        payload: {
          code: e.which
        }
      });
    };
    document.onkeydown = function (e: any) {
      var process = me.pmService.getActiveProcess();
      if (!process) {
        return;
      }
      process.worker.postMessage({
        msg: 'keydown',
        payload: {
          code: e.which
        }
      });
    };
    document.onkeyup = function (e: any) {
      var process = me.pmService.getActiveProcess();
      if (!process) {
        return;
      }
      process.worker.postMessage({
        msg: 'keyup',
        payload: {
          code: e.which
        }
      });
    };
  }
  
  active(window: Window) {
    this.wmService.activeWindow(window);
    if (window.process)
      this.pmService.activeProcess(window.process);
  }

}
