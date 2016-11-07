import {Injectable, NgZone} from '@angular/core';
import {WmService} from './wm.service';
import {App} from './app';
import {Process} from './process';
import {DatastoreService} from "./datastore.service";
import {Instance, User, Version} from "./models";
import {SessiongManagerService} from "./session-manager.service";

@Injectable()
export class ProcessManagerService {
  pid = 0;
  processes: Process[] = [];
  zone: NgZone;

  constructor(private wmService: WmService, private dsService: DatastoreService, private smService: SessiongManagerService) {
    this.zone = new NgZone({enableLongStackTrace: false});
  }


  supportWebrtc() {

    var PC = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    
    var support = !!PC;
    if (window.location.hash.substr(1) == 'nowebrtc') {
      support = false;
    }
    return {
      support: support,
    };
  }

  getProcesses(): Promise<Process[]> {
    return Promise.resolve(this.processes);
  }

  activeProcess(process: Process) {
    this.processes.forEach((proc: Process) => {
      proc.active = false;
    });
    process.active = true;
  }

  getActiveProcess() {
    for (var i in this.processes) {
      if (this.processes[i].active) {
        return this.processes[i];
      }
    }
    return null;
  }

  encode(input: any) {
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var chr1: any, chr2: any, chr3: any, enc1: any, enc2: any, enc3: any, enc4: any;
    var i = 0;

    while (i < input.length) {
      chr1 = input[i++];
      chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index
      chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }
      output += keyStr.charAt(enc1) + keyStr.charAt(enc2) +
        keyStr.charAt(enc3) + keyStr.charAt(enc4);
    }
    return "data:image/x-icon;base64," + output;
  }

  showLoading() {
    return this.wmService.createWindow({
      title: 'Loading...',
      width: 400,
      height: 100,
      x: document.body.clientWidth / 2 - 200,
      y: 150,
      content: `
      <div class="cssload-container">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      `,
      minimizable: false,
      maximizable: false
    }).then(window => {
      return this.wmService.showWindow(window)
    });
  }

  run(app: App) {
    var me = this;
    
    this.showLoading().then((loadingWindow) => {
      
      if (app.type == 'cloudware') {
        let instance = me.dsService.createRecord(Instance, {
          user: me.dsService.peekRecord(User, me.smService.currentUser.id),
          version: me.dsService.peekRecord(Version, app.id),
          width: window.innerWidth,
          height: window.innerHeight - 40,
          usewebrtc: me.supportWebrtc().support
        });
        instance.save().subscribe(
          (ins: Instance) => {
            var process = new Process({
              pid: this.pid++,
              entry: '/assets/js/cloudware.js',
              app: app,
              instance: ins,
              token: ins.token
            });
            this.processes.push(process);
            this.activeProcess(process);
            process.worker.onmessage = function (msg: any) {
              me.wmService.destroyWindow(loadingWindow);
              return me.handleMessage(msg, process);
            }
          }
        );
        
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
          me.wmService.destroyWindow(loadingWindow);
          return me.handleMessage(msg, process);
        }
      }
    });

  }
  
  private makeSrc(src: string, proc: Process) {
    if (!src) {
      return null;
    }
    return (src.indexOf('http') === 0)?src:(proc.app.url + '/' + src);
  }


  private handleMessage(msg: any, process: Process) {
    var me = this;
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
      case 'screen':
        switch (action) {
          case 'renderFrame':

            /* adjust size of screen canvas */
            if (payload.width !== self.screen.width || payload.height !== self.screen.height) {
              process.screen.width = payload.width;
              process.screen.height = payload.height;
              process.screen.imageData = process.screen.canvas.getContext('2d').createImageData(payload.width, payload.height);
            }
            process.screen.imageData.data.set(payload.buffer);
            process.windows.forEach(function (window) {
              if (window.startRender && window.canvas) {
                window.canvas.width = window.width;
                window.canvas.height = window.height;
                window.canvas.getContext('2d').putImageData(process.screen.imageData, -window.x, -window.y);
              }
            });
            break;
          case 'setCursor':
            var cursor64 = this.encode(new Uint8Array(payload.iconBuffer));
            /* 工字形鼠标返回空图片,特殊处理 */
            if (cursor64.substr(39) == 'AAAADoAgAAFgAAACgAAAAgAAAAQAAAAAEABAAAAAAAgAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAACAAAAAgIAAgAAAAIAAgACAgAAAgICAAMDAwAAAAP8AAP8AAAD//wD/AAAA/wD/AP//AAD///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/w//AAAAAAAAAAAAAAAAAADwAAAAAAAAAAAAAAAAAAAA8AAAAAAAAAAAAAAAAAAAAPAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAAAAAAAAAAA8AAAAAAAAAAAAAAAAAAAAPAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAAAAAAAAAAA8AAAAAAAAAAAAAAAAAAAAPAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAAAAAAAAAAA8AAAAAAAAAAAAAAAAAAAAPAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAAAAAAAAAAA8AAAAAAAAAAAAAAAAAAP/w//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////w==' || cursor64.substr(39) == 'AAAADoAgAAFgAAACgAAAAgAAAAQAAAAAEABAAAAAAAgAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAACAAAAAgIAAgAAAAIAAgACAgAAAgICAAMDAwAAAAP8AAP8AAAD//wD/AAAA/wD/AP//AAD///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/8P/wAAAAAAAAAAAAAAAAAA8AAAAAAAAAAAAAAAAAAAAPAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAAAAAAAAAAA8AAAAAAAAAAAAAAAAAAAAPAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAAAAAAAAAAA8AAAAAAAAAAAAAAAAAAAAPAAAAAAAAAAAAAAAAAAAADwAAAA////AAAAAAAAAAAA8AAAAAAAAAAAAAAAAAAAAPAAAAD//////wAAAAAAAADwAAAAAAAAAAAAAAAAAAAA8AAAAP///wAAAAAAAAAAAPAAAAAAAAAAAAAAAAAAD/8P/wAA//////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////w==') {
              cursor64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAPElEQVRYhe3VsQoAIAhAQev//9n2lnAoqO42SeRtRfyuLd5z2p3no3K9Utd3HBUgQIAAAQIqrvqOAeBNA2bsBRzk+8IJAAAAAElFTkSuQmCC';
            }
            //noinspection TypeScriptUnresolvedVariable
            document.getElementsByTagName('body')[0].style.cursor = "url('" + cursor64 + "')" + payload.xspot + ' ' + payload.yspot + ", auto";
        }
        break;
      case 'app':
        switch (action) {
          case 'info':
            makeReply(request, process.app.config);
            break;
          case 'exit':
            process.windows.forEach(function (window) {
              me.zone.run(() => {
                me.wmService.destroyWindow(window);
              });
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
            var video_node = document.getElementById(process.screen.video_id);
            if (video_node) {
              video_node.parentNode.removeChild(video_node);
            }
            break;
        }
        break;
      case 'instance':
        switch (action) {
          case 'token':
            makeReply(request, process.instance.token);
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
              width: payload.width || 1,
              height: payload.height || 1,
              content: payload.content || '',
              process: process,
              type: payload.type || 'normal',
              bare: payload.bare || false,
              src: this.makeSrc(payload.src, process) || null
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
          case 'hide':
            var window = this.wmService.getWindowById(payload);
            if (window) {
              window.hide();
            }
            break;
          case 'configure':
            var window = this.wmService.getWindowById(payload.id);
            if (window) {
              this.zone.run(() => {
                window.configure(payload.styles);
              });
            }

            break;
          case 'destroy':
            var window = this.wmService.getWindowById(payload);
            if (window) {
              this.zone.run(() => {
                this.wmService.destroyWindow(window);
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
