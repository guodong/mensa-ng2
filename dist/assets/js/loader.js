importScripts('/assets/js/lib/Decoder.js');

var Libmensa;
(function() {
  var g_seq = 0;
  var g_callbacks = [];
  var g_requests = [];
  var g_windows = [];


  function findWindow(id) {
    for (var i in g_windows) {
      if (g_windows[i].id == id) {
        return g_windows[i];
      }
    }
    return null;
  }
  
  function Window(id) {
    this.id = id;
    this.listeners = {};
    this.sendList = [];
  }

  Window.prototype = {
    on: function(eventName, handle) {
      this.listeners[eventName] = handle;
    },
    fire: function(eventName) {
      (this.listeners[eventName] || function() {
      })();
    },
    show: function() {
      var self = this;
      if (!this.id) {
        this.sendList.push(function() {
          makeRequest({
            resource: 'window',
            action: 'show',
            payload: self.id
          });
        })
      } else {
        makeRequest({
          resource: 'window',
          action: 'show',
          payload: self.id
        });
      }
    },
    destroy: function() {
      makeRequest({
        resource: 'window',
        action: 'destroy',
        payload: this.id
      });
    },
    hide: function() {

      makeRequest({
        resource: 'window',
        action: 'hide',
        payload: this.id
      });
    },
    configure: function(opts) {
      opts["id"] = this.id;
      var self = this;
      if (!this.id) {
        this.sendList.push(function() {
          makeRequest({
            resource: 'window',
            id: self.id,
            action: 'configure',
            payload: opts
          });
        })
      } else {
        makeRequest({
          resource: 'window',
          id: self.id,
          action: 'configure',
          payload: opts
        });
      }
    },
    renderFrame: function(opts) {
      // opts.id = this.id;
      // makeRequest({
      //   resource: 'window',
      //   action: 'renderFrame',
      //   payload: opts
      // });
      if (!this.id) {
        return;
      }
      var data = new Uint8Array(opts.data);
      var req = {
        seq: g_seq++,
        resource: 'window',
        action: 'renderFrame',
        payload: {
          id: this.id,
          width: opts.width,
          height: opts.height
        },
        buf: opts.data
      };
      g_requests[req.seq] = req;
      postMessage(req, [opts.data.buffer]);
    }
  };
  
  function makeRequest(req, cb) {
    var request = {
      seq: g_seq++,
      resource: null,
      id: null,
      action: null,
      payload: null
    };
    for (var i in req) {
      request[i] = req[i];
    }
    
    if (cb) {
      g_callbacks[request.seq] = cb;
    }
    g_requests[request.seq] = request;
    postMessage(request);
  }


  Libmensa = {
    listeners: {},
    on: function(eventName, handle) {
      Libmensa.listeners[eventName] = handle;
    },
    fire: function(eventName, args) {
      (Libmensa.listeners[eventName] || function() {
      })(args);
    },
    getScreenInfo: function(cb) {
      makeRequest({
        resource: 'screen',
        action: 'get'
      }, cb);
    },
    ajax: function(opts) {
      var url = opts.url || '';
      var method = opts.method || 'GET';

      var data = opts.data || {};
      data_array = [];
      for (idx in data) {
        data_array.push(idx + "=" + data[idx]);
      }
      data_string = data_array.join("&");

      var req = new XMLHttpRequest();
      req.open(method, url, false);
      req.setRequestHeader("Content-type", "application/vnd.api+json");
      req.onreadystatechange = function() {
        if (req.readyState === 4 && req.status === 200) {
          return (opts.success || function() {
          })(req.responseText);
        }
      };
      (opts.beforeSend || function(req) {
      })(req);
      req.send(JSON.stringify(data));
      return req;
    },
    appInfo: function(cb) {
      makeRequest({
        resource: 'info',
        action: 'get'
      }, cb);
    },
    renderFrame: function(buffer, width, height, info) {
      // var data = new Uint8Array(buffer);
      var req = {
        seq: g_seq++,
        resource: 'screen',
        action: 'renderFrame',
        payload: {
          width: width,
          height: height,
          buffer: buffer
        }
      };
      g_requests[req.seq] = req;
      postMessage(req, [buffer.buffer]);
    },
    setCursor: function(opts) {
      var req = {
        seq: g_seq++,
        resource: 'screen',
        action: 'setCursor',
        payload: opts
      };
      //g_requests.push(req);
      postMessage(req, [opts.iconBuffer]);
    },
    createWindow: function(opts, cb) {
      var window = new Window();
      window.wid = opts.wid;

      g_windows.push(window);
      makeRequest({
        resource: 'window',
        action: 'create',
        payload: opts
      }, cb);
    },
    findWindowByWid: function(wid) {
      for (var i in g_windows) {
        if (g_windows[i].wid == wid) {
          return g_windows[i];
        }
      }
      return null;
    },
    exit: function() {
      makeRequest({
        resource: 'app',
        action: 'exit'
      });
    },

    onmessage: function(msg) {
      var reply = msg.data;
      var seq = reply.seq;
      if (seq !== undefined) {
        var req = g_requests[seq];
        if (req) {
          var param = msg.data.payload;
          if (req.resource === 'window' && req.action === 'create') {
            // var window = new Window(msg.data.payload);
            // g_windows.push(window);
            var window = Libmensa.findWindowByWid(req.payload.wid);
            window.id = reply.payload;
            for (var i in window.sendList) {
              window.sendList[i]();
            }
            param = window;
          }
          (g_callbacks[seq] || function() {
          })(param, req);
        }


        // if (req.resource === 'window' && req.action === 'destroy') {
        //   var window = findWindow(msg.data.reply);
        //   if (window)
        //     window.fire('destroy');
        // }

      }
      /* msg handle */
      if (msg.data.msg === 'destroy') {
        var window = findWindow(msg.data.payload);

        if (window)
          window.fire('destroy');
      }
      if (msg.data.msg) {
        Libmensa.fire(msg.data.msg, msg.data.payload);
      }
    }
  };
})();

onmessage = function(msg) {
  onmessage = Libmensa.onmessage;
  Libmensa.cloudwareVersionId = msg.data.version_id;
  Libmensa.sysname = msg.data.sysname;
  Libmensa.token = msg.data.token;
  importScripts(msg.data.entry);
};
