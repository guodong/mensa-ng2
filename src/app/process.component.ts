import {Component, OnInit, Input, NgZone} from '@angular/core';
import {WmService} from "./wm.service";
import {Process} from "./process";
import {Window} from "./window";

@Component({
  selector: 'process',
  template: ''
})
export class ProcessComponent implements OnInit {
  @Input()
  process: Process;

  screen: any;
  zone: NgZone;
  signal: any;
  pc: any;
  dc: any;
  windows: Window[] = [];

  constructor(private wmService: WmService) {
  }

  ngOnInit() {
    var me = this;

    this.zone = new NgZone({enableLongStackTrace: false});
    me.process.windows = me.windows;
    me.process.dc.onmessage = function (event) {
      console.log(event.data);
      var msg = JSON.parse(event.data);
      var payload = msg.payload;
      switch (msg.resource) {
        case 'window':
          switch (msg.action) {
            case 'create':

              var opts = {
                id: payload.id,
                title: 'window',
                x: payload.x || 0,
                y: payload.y || 0,
                width: payload.width || 1,
                height: payload.height || 1,
                content: payload.content || '',
                process: me.process,
                type: 'cloudware',
                bare: true,//payload.bare || false,
                src: null
              };
              me.zone.run(() => {
                me.wmService.createWindow(opts).then(window => {
                  me.windows.push(window);
                });
              });
              break;
            case 'show':
              var window = me.wmService.getWindowById(payload.id);
              if (window) {
                me.zone.run(() => {
                  me.wmService.showWindow(window);
                });
              }
              break;
            case 'hide':
              var window = me.wmService.getWindowById(payload.id);
              if (window) {
                me.zone.run(() => {
                  window.hide()
                });
              }
              break;
            case 'configure':
              var window = me.wmService.getWindowById(payload.id);
              if (window) {
                me.zone.run(() => {
                  window.configure(payload);
                });
              }

              break;
            case 'destroy':
              var window = me.wmService.getWindowById(payload.id);
              if (window) {
                me.zone.run(() => {
                  me.wmService.destroyWindow(window);
                });
              }
              break;
          }
          break;
      }
    };

  }

  startPeerConnection() {
    var me = this;
    var iceServer = {
      "iceServers": [{
        "url": "turn:106.75.71.14:3478?transport=tcp",
        "username": "gd",
        "credential": "gd"
      }]
    };
    me.pc = new RTCPeerConnection(iceServer);
    var pc = me.pc;
    var socket = me.signal;
    var dc = pc.createDataChannel("event channel");
    me.dc = dc;


    pc.onicecandidate = function (event) {
      if (event.candidate !== null) {
        var candidate = event.candidate.candidate;
        if (candidate.indexOf("relay") < 0) { // if no relay address is found, assuming it means no TURN server
          //return;
        }
        setTimeout(function () {
          socket.send(JSON.stringify(event.candidate));
        }, 2000);

      }
    };

    // 如果检测到媒体流连接到本地，将其绑定到一个video标签上输出
    pc.onaddstream = function (event: any) {
      var video = <HTMLVideoElement> document.getElementById(me.screen.video_id);
      var video = (<HTMLVideoElement>video);
      (function loop() {
        //if (!$this.paused && !$this.ended) {
        me.windows.forEach(function (window) {
          if (window.visible && window.startRender && window.canvas) {
            window.canvas.width = window.width;
            window.canvas.height = window.height;
            window.canvas.getContext('2d').drawImage(video, -window.x, -window.y);
          }
        });
        setTimeout(loop, 0);
        //}
      })();
      video.src = URL.createObjectURL(event.stream);
      setInterval(function () {
        video.play();
      }, 2000);
    };

    var sendOfferFn = function (desc: any) {
      desc.sdp = me.setBandwidth(desc.sdp, 50, 4500);
      pc.setLocalDescription(desc);
      setTimeout(function () {
        socket.send(JSON.stringify(desc));
      }, 2000);
    };

    pc.createOffer(sendOfferFn, function (error) {
      console.log('Failure callback: ' + error);
    }, {offerToReceiveVideo: true});
  }

  setBandwidth(sdp: string, audioBandwidth: number, videoBandwidth: number) {
    sdp = sdp.replace(/a=mid:audio\r\n/g, 'a=mid:audio\r\nb=AS:' + audioBandwidth + '\r\n');
    sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + videoBandwidth + '\r\n');
    return sdp;
  }
}