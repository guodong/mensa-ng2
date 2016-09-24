import {App} from './app';

export class Process {
  screen: any;
  app: App;
  worker: Worker;

  constructor(args: any) {
    for (var i in args) {
      this[i] = args[i];
    }
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

    var makeReply = function(req: any, payload: any) {
      var data = {
        seq: req.seq,
        payload: payload
      };
      worker.postMessage(data);
    };
    
    var me = this;
    
  }
  
}