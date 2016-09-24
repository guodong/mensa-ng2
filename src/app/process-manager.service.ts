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

  run(app: App) {
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
      var makeReply = function (req: any, payload: any) {
        var data = {
          seq: req.seq,
          payload: payload
        };
        process.worker.postMessage(data);
      };
      var me = this;
      var t = function () {
        me.wmService.createWindow({
          x: '100',
          y: '100',
          width: '200',
          height: '200',
          title: 'abc',
          content: 'haha'
        });
      }
      process.worker.onmessage = function (msg) {
        // if (me.mask) {
        //   me.mask.hide();
        //   me.mask.destroy();
        //   me.mask = null;
        // }
        var request = msg.data;
        var resource = request.resource,
          action = request.action,
          payload = request.payload;
        switch (resource) {


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
                me.zone.run(() => {
                  me.wmService.createWindow(opts).then(window => {
                    makeReply(request, window.id);
                  });
                });
                break;
              case 'show':
                var window = me.wmService.getWindowById(payload);
                if (window) {
                  me.zone.run(() => {
                    me.wmService.showWindow(window);
                  });
                }
                break;
            }
            break;
        }
      }
    }
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
