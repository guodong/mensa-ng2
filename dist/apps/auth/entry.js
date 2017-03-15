
Libmensa.createWindow({
  title: 'Login to CloudwareHub',
  src: 'http://www.cloudwarehub.com/#/login/signin',
  width: 500,
  height: 400,
  x: 400,
  y: 100
}, function(window) {
  window.show();
  window.on('destroy', function() {
    Libmensa.exit();
  })
});