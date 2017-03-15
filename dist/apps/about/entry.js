
Libmensa.createWindow({
  title: 'About mensa',
  width: 500,
  height: 500,
  x: 400,
  y: 100,
  src: 'index.html'
}, function(window) {
  window.show();
  window.on('destroy', function() {
    Libmensa.exit();
  })
});