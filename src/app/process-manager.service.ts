import {Injectable, NgZone} from '@angular/core';
import {WmService} from './wm.service';
import {App} from './app';
import {Process} from './process';

@Injectable()
export class ProcessManagerService {
  pid = 0;
  processes: Process[] = [];
  zone: NgZone;

  constructor(private wmService: WmService) {
    this.zone = new NgZone({enableLongStackTrace: false});
  }
  
  getProcesses() {
    return this.processes;
  }

  activeProcess(process: Process) {
    this.processes.forEach((proc: Process) => {
      proc.active = false;
    });
    process.active = true;
  }

  run(app: App) {
    var me = this;
    if (app.type == 'cloudware') {
      // var process = new Process({
      //   pid: pid++,
      //   entry: 'cloudware.js',
      //   app: app
      // });
      // processes.push(process);
      //
      // var icon = new MinIcon({process: process});
      // icon.setProps({
      //   iconSrc: mensa.api + '/uploads/' + app.config.cloudware.logo
      // });
      //
      // mensa.registry.findComponentByName('MenuList').appendChild(icon);
      // process.taskicon = icon;
    } else {
      var url = app.url + '/' + app.config.entry;
      var process = new Process({
        pid: this.pid++,
        entry: url,
        app: app
      });
      this.processes.push(process);

      this.activeProcess(process);

      process.worker.onmessage = function (msg: any) {
        return me.handleMessage(msg, process);
      }
    }
  }


  private handleMessage(msg: any, process: Process) {
    var makeReply = function (req: any, payload: any) {
      var data = {
        seq: req.seq,
        payload: payload
      };
      process.worker.postMessage(data);
    };
    var request = msg.data;
    var resource = request.resource,
      action = request.action,
      payload = request.payload;
    switch (resource) {

      case 'app':
        switch (action) {
          case 'info':
            makeReply(request, process.app.config);
            break;
          case 'exit':
            process.windows.forEach(function(window) {
              window.destroy();
            });
            for (var i in this.processes) {
              if (this.processes[i] == process) {
                this.zone.run(() => {
                  this.processes.splice(parseInt(i), 1);
                });
                break;
              }
            }
            //noinspection TypeScriptUnresolvedVariable
            document.getElementsByTagName('body')[0].style.cursor = 'default';
            break;
        }
        break;
      case 'window':
        switch (action) {
          case 'create':
            var opts = {
              title: payload.title || 'window',
              x: payload.x || 0,
              y: payload.y || 0,
              width: payload.width || 300,
              height: payload.height || 200,
              content: payload.content || '',
              process: process,
              type: payload.type || 'normal',
              bare: payload.bare || false
            };
            this.zone.run(() => {
              this.wmService.createWindow(opts).then(window => {
                process.windows.push(window);
                makeReply(request, window.id);
              });
            });
            break;
          case 'show':
            var window = this.wmService.getWindowById(payload);
            if (window) {
              this.zone.run(() => {
                this.wmService.showWindow(window);
              });
            }
            break;
        }
        break;
    }
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
