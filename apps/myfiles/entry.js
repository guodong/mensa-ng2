
Libmensa.createWindow({
  title: 'My Files',
  width: 800,
  height: 600,
  x: 400,
  y: 100,
  src: 'http://files.cloudwarehub.com:8080/files?sysname='+Libmensa.sysname
}, function(window) {
  window.show();
  window.on('destroy', function() {
    Libmensa.exit();
  })
});