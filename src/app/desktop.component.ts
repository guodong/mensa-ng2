import {Component, OnInit, Input, ChangeDetectionStrategy} from '@angular/core';
import {Window} from './window';
import {WmService} from './wm.service';
import {ProcessManagerService} from './process-manager.service';
import {App} from "./app";
import {RegistryService} from "./registry.service";
import {Process} from './process';
import {WarpgateService} from "./warpgate.service";

@Component({
  selector: 'desktop',
  templateUrl: './desktop.component.html',
  styleUrls: ['./desktop.component.css']
})
export class DesktopComponent implements OnInit {
  @Input()
  windows: Window[];

  processes: Process[];

  apps: App[] = [];

  useML: boolean = false;

  constructor(private wmService: WmService, private pmService: ProcessManagerService,
              private registryService: RegistryService,
              private warpgateService: WarpgateService) {
  }

  ngOnInit(): void {
    var me = this;
    this.wmService.getWindows().then(windows => this.windows = windows);
    this.apps = this.registryService.getApps();

    if (me.useML) {
      var p; // timeout handle
      document.onmousemove = function (e: any) {
        clearTimeout(p);
        var process = me.pmService.getActiveProcess();
        if (!process) {
          return;
        }
        var pos = me.warpgateService.predict({
          time: (new Date).getTime(),
          position: [e.pageX, e.pageY]
        });
        process.worker.postMessage({
          msg: 'mousemove',
          payload: {
            id: 0,
            x: pos.position[0],
            y: pos.position[1]
          }
        });
        p = setTimeout(function () {
          for (var i = 0; i < 6; i++) {
            var pos = me.warpgateService.predict({
              time: (new Date).getTime(),
              position: [e.pageX, e.pageY]
            });
            process.worker.postMessage({
              msg: 'mousemove',
              payload: {
                id: 0,
                x: pos.position[0],
                y: pos.position[1]
              }
            });
          }
        }, 20);
      };
    } else {
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
    }

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
