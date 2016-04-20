var menubar = require('menubar')
var path = require('path')
var Dat = require('dat-server')
var electron = require('electron')
var notifier = require('node-notifier')

var datIcon = path.join(__dirname, 'img', 'icon.png')
var ipc = electron.ipcMain

var mb = menubar({
  dir: __dirname,
  icon: datIcon,
  width: 430,
  preloadWindow: true
})

process.on('uncaughtException', function (err) {
  electron.dialog.showErrorBox('Uncaught Exception: ' + err.message, err.stack || '')
  mb.app.quit()
})

mb.on('show', function show () {
  app.send('show')
})

ipc.on('quit', function terminate (ev) {
  mb.app.terminate()
})

ipc.on('hide', function hide (ev) {
  mb.hideWindow()
})

var Server = require('electron-rpc/server')
var app = new Server()
var manager = Dat()

mb.on('after-create-window', function () {
  app.configure(mb.window.webContents)
})

mb.on('ready', function () {
  mb.tray.on('drop-files', function (event, paths) {
    if (mb.window) mb.window.webContents.send('share', paths[0])
  })

  app.on('notify', function (req) {
    req.body.icon = null
    req.body.appIcon = null
    req.body.contentImage = null
    req.body.sender = 'com.electron.dat'
    notifier.notify(req.body)
  })

  app.on('status', function (req, cb) {
    manager.status(cb)
  })

  app.on('link', function (req, cb) {
    manager.link(req.body.dir, function (err, link) {
      if (err) return cb(err)
      manager.join(link, req.body.dir, {}, cb)
    })
  })

  app.on('start', function (req, cb) {
    manager.join(req.body.link, req.body.dir, req.body.opts, cb)
  })

  app.on('stop', function (req, cb) {
    manager.leave(req.body.dir, cb)
  })
})
