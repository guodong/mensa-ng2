import {NgZone} from '@angular/core';
import {App} from './app';
import {Window} from './window';

export class Process {
  screen: any;
  app: App;
  worker: Worker;
  windows: Window[] = [];
  active: boolean = false;
  zone: NgZone;
  instance: any;
  token: string;
  useWebrtc: boolean = false;
  pc: any; //peer connection
  signal: any; //signal socket

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

  constructor(args: any) {
    for (var i in args) {
      this[i] = args[i];
    }
    var me = this;
    this.useWebrtc = this.supportWebrtc().support;

    this.zone = new NgZone({enableLongStackTrace: false});
    this.screen = {
      width: 0,
      height: 0,
      canvas: document.createElement('canvas'),
      video: document.createElement('video'),
      video_id: this.token
    };

    var worker = this.worker = new Worker('/assets/js/loader.js');
    var info = JSON.parse(localStorage.getItem('user'));
    worker.postMessage({
      entry: this.app.entry,
      version_id: this.app.config.id,
      sysname: info.sysname,
      token: this.token
    });

    if (this.useWebrtc) {

      this.screen.video.setAttribute('id', this.screen.video_id);
      document.body.appendChild(this.screen.video);
      document.getElementById(me.screen.video_id).setAttribute('autoplay', 'true');

      var socket = new WebSocket("ws://switch.cloudwarehub.com/?token=" + this.token + "_conn");
      me.signal = socket;

      socket.onmessage = function (event) {
        var d = event.data.replace("\r\n", "\\r\\n");
        if (event.data == "ready") {
          me.startPeerConnection();
          return;
        }
        var json = JSON.parse(d);

        if (event.data.length < 400) {
          me.pc.addIceCandidate(new RTCIceCandidate(json));
        } else {
          me.pc.setRemoteDescription(new RTCSessionDescription(json));
        }
      };
    }

  }

  startPeerConnection() {
    var me = this;
    var iceServer = {
      "iceServers": [{
        "url": "turn:106.75.71.14:3478?transport=udp",
        "username": "gd",
        "credential": "gd"
      }]
    };
    me.pc = new RTCPeerConnection(iceServer);
    var pc = me.pc;
    var socket = me.signal;
    pc.onicecandidate = function (event) {
      if (event.candidate !== null) {
        socket.send(JSON.stringify(event.candidate));
      }
    };

    // 如果检测到媒体流连接到本地，将其绑定到一个video标签上输出
    pc.onaddstream = function (event: any) {
      var video = <HTMLVideoElement> document.getElementById(me.screen.video_id);
      var video = (<HTMLVideoElement>video);
      //me.screen.video.src = URL.createObjectURL(event.stream);
      video.src = URL.createObjectURL(event.stream);
      var p = setInterval(function () {
        video.play();
        console.log('play');
      }, 500);
      video.addEventListener('playing', function () {
        console.log('stop intalval');
        clearInterval(p);
      });
      video.addEventListener('play', function() {
        var $this = this; //cache
        (function loop() {
          if (!$this.paused && !$this.ended) {
            me.windows.forEach(function (window) {
              if (window.startRender && window.canvas) {
                window.canvas.width = window.width;
                window.canvas.height = window.height;
                window.canvas.getContext('2d').drawImage(video, -window.x, -window.y);
              }
            });
            setTimeout(loop, 0);
          }
        })();
      });
    };

    var sendOfferFn = function (desc: any) {
      pc.setLocalDescription(desc);
      socket.send(JSON.stringify(desc));
    };

    pc.createOffer(sendOfferFn, function (error) {
      console.log('Failure callback: ' + error);
    }, {offerToReceiveVideo: true});
  }
}