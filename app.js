var menubar = require('menubar')
var ipc = require('electron').ipcMain
var path = require('path')

var mb = menubar({
  dir: __dirname,
  icon: path.join(__dirname, 'static', 'images', 'dat-icon.png'),
  width: 250
})

mb.on('ready', function ready () {
  console.log('ready')
})

ipc.on('terminate', function terminate (ev) {
  mb.app.terminate()
})

ipc.on('hide', function hide (ev) {
  mb.hideWindow()
})
