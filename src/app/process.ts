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

  constructor(args: any) {
    for (var i in args) {
      this[i] = args[i];
    }


    this.zone = new NgZone({enableLongStackTrace: false});
    this.screen = {
      width: 0,
      height: 0,
      canvas: document.createElement('canvas')
    };

    var worker = this.worker = new Worker('/assets/js/loader.js');
    var info = JSON.parse(localStorage.getItem('user'));
    worker.postMessage({entry: this.app.entry, version_id: this.app.config.id, sysname: info.sysname, token: this.token});

  }
}