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

    var self = this;

    if (this.app.type == 'cloudware') {
      // this.mask = new Mask();
      // this.mask.show();
    }

    var worker = this.worker = new Worker('/assets/js/loader.js');

    worker.postMessage({entry: this.app.url + '/' + this.app.config.entry, version_id: this.app.config.id});
    
  }
}