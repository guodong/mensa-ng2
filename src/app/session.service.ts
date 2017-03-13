export class SessionService {
  ws: any;

  constructor() {
    this.ws = new WebSocket('ws://'+document.domain+':8081');
  }
  
  send(msg) {
    var me = this;
    me.ws.send(msg);
  }
}