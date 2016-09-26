(function() {
  if (!ArrayBuffer.prototype.slice) {
    //Returns a new ArrayBuffer whose contents are a copy of this ArrayBuffer's
    //bytes from `begin`, inclusive, up to `end`, exclusive
    ArrayBuffer.prototype.slice = function (begin, end) {
      //If `begin` is unspecified, Chrome assumes 0, so we do the same
      if (begin === void 0) {
        begin = 0;
      }

      //If `end` is unspecified, the new ArrayBuffer contains all
      //bytes from `begin` to the end of this ArrayBuffer.
      if (end === void 0) {
        end = this.byteLength;
      }

      //Chrome converts the values to integers via flooring
      begin = Math.floor(begin);
      end = Math.floor(end);

      //If either `begin` or `end` is negative, it refers to an
      //index from the end of the array, as opposed to from the beginning.
      if (begin < 0) {
        begin += this.byteLength;
      }
      if (end < 0) {
        end += this.byteLength;
      }

      //The range specified by the `begin` and `end` values is clamped to the
      //valid index range for the current array.
      begin = Math.min(Math.max(0, begin), this.byteLength);
      end = Math.min(Math.max(0, end), this.byteLength);

      //If the computed length of the new ArrayBuffer would be negative, it
      //is clamped to zero.
      if (end - begin <= 0) {
        return new ArrayBuffer(0);
      }

      var result = new ArrayBuffer(end - begin);
      var resultBytes = new Uint8Array(result);
      var sourceBytes = new Uint8Array(this, begin, end - begin);

      resultBytes.set(sourceBytes);

      return result;
    };
  }
  var Cip = {
    CIP_CHANNEL_MASTER: 0,
    CIP_CHANNEL_EVENT: 1,
    CIP_CHANNEL_DISPLAY: 2,
    EVENT: {
      CIP_EVENT_WINDOW_CREATE: 0,
      CIP_EVENT_WINDOW_DESTROY: 1,
      CIP_EVENT_WINDOW_SHOW: 2,
      CIP_EVENT_WINDOW_HIDE: 3,
      CIP_EVENT_WINDOW_CONFIGURE: 4,
      CIP_EVENT_WINDOW_FRAME: 15,
      CIP_EVENT_EXIT: 16,
      CIP_EVENT_CURSOR: 17
    }
  };

  var ws = null;

  function handleMsg(msg) {
    if (!ws)
      return;
    var wid = 0;
    switch (msg.data.msg) {
      case 'mousemove':
        var buf = new ArrayBuffer(9);
        var dv = new DataView(buf);
        dv.setUint8(0, 5, true);
        dv.setUint32(1, wid, true);
        dv.setInt16(5, msg.data.payload.x, true);
        dv.setInt16(7, msg.data.payload.y, true);
        ws.send(buf);
        break;
      case 'mousedown':
        var buf = new ArrayBuffer(6);
        var dv = new DataView(buf);
        dv.setUint8(0, 6, true);
        dv.setUint32(1, wid, true);
        dv.setUint8(5, msg.data.data.code, true);
        ws.send(buf);
        break;
      case 'mouseup':
        var buf = new ArrayBuffer(6);
        var dv = new DataView(buf);
        dv.setUint8(0, 7, true);
        dv.setUint32(1, wid, true);
        dv.setUint8(5, msg.data.data.code, true);
        ws.send(buf);
        break;
      case 'windowMove':
        var buf = new ArrayBuffer(9);
        var dv = new DataView(buf);
        dv.setUint8(0, 10, true);
        dv.setUint32(1, wid, true);
        dv.setInt16(5, msg.data.data.x, true);
        dv.setInt16(7, msg.data.data.y, true);
        ws.send(buf);
        break;
      case 'windowResize':
        var buf = new ArrayBuffer(9);
        var dv = new DataView(buf);
        dv.setUint8(0, 11, true);
        dv.setUint32(1, wid, true);
        dv.setUint16(5, msg.data.data.width, true);
        dv.setUint16(7, msg.data.data.height, true);
        ws.send(buf);
        break;
      case 'keydown':
        var buf = new ArrayBuffer(6);
        var dv = new DataView(buf);
        dv.setUint8(0, 8, true);
        dv.setUint32(1, 0, true);
        dv.setUint8(5, msg.data.data.code, true);
        ws.send(buf);
        break;
      case 'keyup':
        var buf = new ArrayBuffer(6);
        var dv = new DataView(buf);
        dv.setUint8(0, 9, true);
        dv.setUint32(1, 0, true);
        dv.setUint8(5, msg.data.data.code, true);
        ws.send(buf);
        break;
      default:
        break;
    }
  }

  function run(addr) {
    var decoder = new Decoder({rgb: true});
    decoder.onPictureDecoded = function(buffer, width, height, infos) {
      Libmensa.renderFrame(buffer, width, height, infos);
    };
    ws = new WebSocket('wss://' + addr);
    ws.binaryType = "arraybuffer";
    ws.onmessage = function(msg) {
      var ab = msg.data;
      var dv = new DataView(ab);
      switch (dv.getUint8(0)) {
        case Cip.EVENT.CIP_EVENT_WINDOW_CREATE:
          var cewc_dv = dv;
          var wid = cewc_dv.getUint32(1, true);
          var opts = {
            wid: wid,
            title: 'Cloudware',
            type: 'cloudware',
            wid: cewc_dv.getUint32(1, true),
            styles: {
              left: cewc_dv.getInt16(5, true),
              top: cewc_dv.getInt16(7, true),
              width: cewc_dv.getUint16(9, true),
              height: cewc_dv.getUint16(11, true),
            },
            bare: cewc_dv.getUint8(13, true),
            type: 'cloudware',
            listenEvent: true
          };
          Libmensa.createWindow(opts, function(window) {
          });
          break;
        case Cip.EVENT.CIP_EVENT_WINDOW_SHOW:
          var cews_dv = dv;
          var wid = cews_dv.getUint32(2, true);
          var opts = {
            wid: cews_dv.getUint32(2, true),
            bare: cews_dv.getUint8(1, true)
          };
          var window = Libmensa.findWindowByWid(wid);
          if (window)
            window.show();

          break;
        case Cip.EVENT.CIP_EVENT_WINDOW_HIDE:
          var cewh_dv = dv;
          var wid = cewh_dv.getUint32(1, true);
          var window = Libmensa.findWindowByWid(wid);
          if (window) {
            window.hide();
          }
          break;
        case Cip.EVENT.CIP_EVENT_WINDOW_DESTROY:
          var cewd_dv = dv;
          var wid = cewd_dv.getUint32(1, true);
          var window = Libmensa.findWindowByWid(wid);
          if (window) {
            window.destroy();
          }
          break;
        case Cip.EVENT.CIP_EVENT_WINDOW_CONFIGURE:
          var cewc_dv = dv;
          var wid = cewc_dv.getUint32(1, true);
          var opts = {
            wid: cewc_dv.getUint32(1, true),
            styles: {
              left: cewc_dv.getInt16(5, true),
              top: cewc_dv.getInt16(7, true),
              width: cewc_dv.getUint16(9, true),
              height: cewc_dv.getUint16(11, true),
            },
            above: cewc_dv.getUint32(13, true),
            bare: cewc_dv.getUint8(17, true)
          };
          var window = Libmensa.findWindowByWid(wid);
          if (window) {
            window.configure(opts);
          }
          break;
        case Cip.EVENT.CIP_EVENT_WINDOW_FRAME:
          var wid = dv.getUint32(1, true);
          var opts = {
            wid: wid,
            nal: ab.slice(5)
          };
          decoder.decode(new Uint8Array(opts.nal));

          break;
        case Cip.EVENT.CIP_EVENT_EXIT:
          Libmensa.exit();
          break;
        case Cip.EVENT.CIP_EVENT_CURSOR:
          var opts = {
            xspot: dv.getUint8(1),
            yspot: dv.getUint8(2),
            iconBuffer: ab.slice(3)
          }
          Libmensa.setCursor(opts);
          break;
        default:
          break;
      }
    };
    Libmensa.on('mousemove', function(opts) {
      var buf = new ArrayBuffer(9);
      var dv = new DataView(buf);
      dv.setUint8(0, 5, true);
      dv.setUint32(1, 0, true);
      dv.setInt16(5, opts.x, true);
      dv.setInt16(7, opts.y, true);
      if(ws.readyState === 1)
        ws.send(buf);
    });
    Libmensa.on('mousedown', function(opts) {
      var buf = new ArrayBuffer(6);
      var dv = new DataView(buf);
      dv.setUint8(0, 6, true);
      dv.setUint32(1, 0, true);
      dv.setUint8(5, opts.code, true);
      if(ws.readyState === 1)
        ws.send(buf);
    });
    Libmensa.on('mouseup', function(opts) {
      var buf = new ArrayBuffer(6);
      var dv = new DataView(buf);
      dv.setUint8(0, 7, true);
      dv.setUint32(1, 0, true);
      dv.setUint8(5, opts.code, true);
      if(ws.readyState === 1)
        ws.send(buf);
    });
    Libmensa.on('keydown', function(opts) {
      var buf = new ArrayBuffer(6);
      var dv = new DataView(buf);
      dv.setUint8(0, 8, true);
      dv.setUint32(1, 0, true);
      dv.setUint8(5, opts.code, true);
      if(ws.readyState === 1)
        ws.send(buf);
    });
    Libmensa.on('keyup', function(opts) {
      var buf = new ArrayBuffer(6);
      var dv = new DataView(buf);
      dv.setUint8(0, 9, true);
      dv.setUint32(1, 0, true);
      dv.setUint8(5, opts.code, true);
      if(ws.readyState === 1)
        ws.send(buf);
    });
  }
  Libmensa.ajax({
    url: '//apiv2.cloudwarehub.com/instances',
    method: 'POST',
    data: {
      data: {
        attributes: {

        },
        relationships: {
          version: {
            data: {
              type: 'versions',
              id: Libmensa.cloudwareVersionId
            }
          }
        }
      }
    },
    success: function(data) {
      run('mensa.cloudwarehub.com:9003?port=' + data);
    }
  })
})();
