var menubar = require('menubar')
var path = require('path')
var Manager = require('dat-manager')
var ipc = require('ipc')
var electron = require('electron')
var homedir = require('os-homedir')()
var notifier = require('node-notifier')

var datIcon = path.join(__dirname, 'static', 'images', 'dat-icon.png')

var link, dir

var mb = menubar({
  dir: __dirname,
  icon: datIcon,
  width: 380
})

process.on('uncaughtException', function (err) {
  electron.dialog.showErrorBox('Uncaught Exception: ' + err.message, err.stack || '')
  mb.app.quit()
})

mb.on('show', function show () {
  app.configure(mb.window.webContents)
  mb.window.webContents.on('did-finish-load', function () {
    if (link) mb.window.webContents.send('download', link)
    if (dir) mb.window.webContents.send('share', dir)
    link = false
    dir = false
  })
  app.send('show')
})

ipc.on('quit', function terminate (ev) {
  mb.app.terminate()
})

ipc.on('hide', function hide (ev) {
  mb.hideWindow()
})

var onopen = function (lnk) {
  link = lnk
}

mb.app.on('open-file', onopen)
mb.app.on('open-url', onopen)

var Server = require('electron-rpc/server')
var app = new Server()
var manager = Manager({DB_PATH: path.join(homedir, '.datapp', 'db')})

mb.on('ready', function () {
  mb.tray.on('drop-files', function (event, paths) {
    if (mb.window) mb.window.webContents.send('share', paths[0])
    else dir = paths[0]
  })

  if (link) mb.showWindow()

  app.on('dats', function (req, cb) {
    manager.list(cb)
  })

  app.on('notify', function (req) {
    req.body.icon = null
    req.body.appIcon = null
    req.body.contentImage = null
    req.body.sender = 'com.electron.dat'
    notifier.notify(req.body)
  })

  app.on('share', function (req, cb) {
    var name = path.basename(req.body.location)
    manager.share(name, req.body.location, cb)
  })

  app.on('download', function (req, cb) {
    manager.start(req.body.link, {location: req.body.location, link: req.body.link}, cb)
  })

  app.on('start', function (req, cb) {
    manager.start(req.body.name, cb)
  })

  app.on('stop', function (req, cb) {
    manager.stop(req.body.name, cb)
  })

  app.on('delete', function task (req, cb) {
    manager.delete(req.body.name, cb)
  })
})
