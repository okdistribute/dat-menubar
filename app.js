var menubar = require('menubar')
var ipc = require('ipc')
var path = require('path')

var mb = menubar({
  dir: __dirname,
  icon: path.join(__dirname, 'img', 'dat.png'),
  width: 300,
  height: 480
})

mb.on('ready', function ready () {
  console.log('ready')
})

ipc.on('terminate', function terminate (ev) {
  mb.app.terminate()
})
