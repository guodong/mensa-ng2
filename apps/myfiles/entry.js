
Libmensa.createWindow({
  title: 'My Files',
  width: 500,
  height: 500,
  x: 400,
  y: 100,
  src: 'http://files.cloudwarehub.com/files?sysname='+Libmensa.sysname
}, function(window) {
  window.show();
  window.on('destroy', function() {
    Libmensa.exit();
  })
});