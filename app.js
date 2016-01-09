var menubar = require('menubar')
var mkdirp = require('mkdirp')
var debug = require('debug')('dat-app')
var Dat = require('dat')
var path = require('path')
var parallel = require('run-parallel')
var ipc = require('ipc')
var electron = require('electron')
var homedir = require('os-homedir')()

var datPath = path.join(homedir, '.dat')
mkdirp.sync(datPath)
var configFile = path.join(datPath, 'config.json')
var config = require('./config.js')(configFile)

var RUNNING = {}

var link

var mb = menubar({
  dir: __dirname,
  icon: path.join(__dirname, 'static', 'images', 'dat-icon.png'),
  width: 380
})

process.on('uncaughtException', function (err) {
  electron.dialog.showErrorBox('Uncaught Exception: ' + err.message, err.stack || '')
  mb.app.quit()
})

mb.on('show', function show () {
  app.configure(mb.window.webContents)
  mb.window.webContents.on('did-finish-load', function () {
    if (link) mb.window.webContents.send('open-dat', link)
    link = false
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

mb.on('ready', function () {
  loadDats()
  if (link) mb.showWindow()

  app.on('dats', function (req, cb) {
    config.read()
    cb(config.dats)
  })

  app.on('get-one', function (req, cb) {
    config.read()
    cb(config.get(req.body.path))
  })

  app.on('download', function task (req, cb) {
    download(req.body, cb)
  })

  app.on('share', function task (req, cb) {
    start(req.body, cb)
  })

  app.on('stop', function task (req, cb) {
    stop(req.body, cb)
  })

  app.on('remove', function task (req, cb) {
    config.read()
    stop(req.body, function (err, dat) {
      if (err) return cb(err)
      config.del(dat.path)
      return cb(null, dat)
    })
  })
})

function loadDats () {
  config.read()
  var keys = Object.keys(config.dats)

  var tasks = []
  for (var i = 0; i < keys.length; i++) {
    var dat = config.get(keys[i])
    if (dat.state !== 'inactive') {
      function startdat (dat) {
        return function (cb) {
          start(dat, function (err, dat) {
            if (err) return cb(err)
            if (mb.window) mb.window.webContents.send('update', config.dats)
          })
        }
      }
      tasks.push(startdat(dat))
    }
  }

  parallel(tasks, function done (err) {
    if (!mb.window) return
    if (err) mb.window.webContents.send('error', err.message)
    config.read()
  })
}

function download (dat, cb) {
  config.read()
  var db = Dat()
  debug('downloading', dat)
  db.download(dat.link, dat.path, done)

  function done (err, link, port, close) {
    debug('done', arguments)
    if (err) return cb(err)
    RUNNING[dat.path] = close
    dat.state = 'active'
    dat.date = Date.now()
    config.update(dat)
    if (cb) cb(null, dat)
  }
}

function restart (dat, cb) {
  debug('restarting', dat)
  stop(dat, function (err, dat) {
    debug('done', arguments)
    if (err) throw err
    start(dat, cb)
  })
}

function start (dat, cb) {
  if (RUNNING[dat.path]) return restart(dat, cb)
  config.read()
  dat.state = 'loading'
  config.update(dat)
  debug('starting', dat)
  var db = Dat()
  if (dat.link) return db.download(dat.link, dat.path, done)
  db.add(dat.path, function (err, link) {
    if (err) return cb(err)
    db.joinTcpSwarm(link, done)
  })

  function done (err, link, port, close) {
    debug('done', arguments)
    if (err) return cb(err)
    RUNNING[dat.path] = close
    dat.link = link
    dat.state = 'active'
    dat.date = Date.now()
    config.update(dat)
    if (cb) cb(null, dat)
  }
}

function stop (dat, cb) {
  config.read()
  var close = RUNNING[dat.path]
  debug('stopping', dat)
  if (close) close(done)
  else done()

  function done (err) {
    debug('done', err)
    if (err) return cb(err)
    RUNNING[dat.path] = undefined
    dat.state = 'inactive'
    config.update(dat)
    if (cb) cb(null, dat)
  }
}
