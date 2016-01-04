var menubar = require('menubar')
var fs = require('fs')
var mkdirp = require('mkdirp')
var debug = require('debug')('dat-app')
var Dat = require('dat')
var path = require('path')
var ipc = require('ipc')
var electron = require('electron')
var homedir = require('os-homedir')()

var datPath = path.join(homedir, '.dat')
mkdirp.sync(datPath)
var configFile = path.join(datPath, 'config.json')
var RUNNING = {}

var link
var ready = false

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

var onopen = function (e, lnk) {
  e.preventDefault()
  link = lnk
  mb.showWindow()
}

ipc.on('open-file', onopen)
ipc.on('open-url', onopen)

var Server = require('electron-rpc/server')
var app = new Server()

function writeConfig (data) {
  if (typeof data === 'object') data = JSON.stringify(data, null, 2)
  fs.writeFileSync(configFile, data)
}

function loadConfig () {
  var conf, data
  try {
    data = fs.readFileSync(configFile)
  } catch (e) {
    if (e.code === 'ENOENT') {
      var defaultConfig = fs.readFileSync(path.join(__dirname, 'config.json')).toString()
      writeConfig(defaultConfig)
      return loadConfig()
    } else {
      throw e
    }
  }

  try {
    conf = JSON.parse(data.toString())
  } catch (e) {
    var code = electron.dialog.showMessageBox({
      message: 'Invalid configuration file\nCould not parse JSON',
      detail: e.stack,
      buttons: ['Reload Config', 'Exit app']
    })
    if (code === 0) {
      return loadConfig()
    } else {
      mb.app.quit()
      return
    }
  }

  return conf
}

mb.on('ready', function () {
  app.on('dats', function (req, cb) {
    var conf = loadConfig()
    cb(conf.dats)
  })

  app.on('get-one', function (req, cb) {
    var conf = loadConfig()
    cb(conf.dats[req.body.path])
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
    var config = loadConfig()
    stop(req.body, function (err, dat) {
      if (err) return cb(err)
      delete config.dats[dat.path]
      writeConfig(config)
      return cb(null, dat)
    })
  })

  function download (dat, cb) {
    var config = loadConfig()
    var db = Dat(dat.path)
    debug('downloading', dat)
    db.download(dat.link, done)

    function done (err, link, port, close) {
      debug('done', arguments)
      if (err) return cb(err)
      RUNNING[dat.path] = close
      dat.state = 'active'
      dat.date = Date.now()
      config.dats[dat.path] = dat
      writeConfig(config)
      cb(null, dat)
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
    var config = loadConfig()
    var db = Dat(dat.path)
    debug('starting', dat)
    db.addDirectory(function (err, link) {
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
      config.dats[dat.path] = dat
      writeConfig(config)
      cb(null, dat)
    }
  }

  function stop (dat, cb) {
    var config = loadConfig()
    var close = RUNNING[dat.path]
    debug('stopping', dat)
    if (close) close(done)
    else done()

    function done (err) {
      debug('done', err)
      if (err) return cb(err)
      RUNNING[dat.path] = undefined
      dat.state = 'inactive'
      console.log('closing', dat)
      config.dats[dat.path] = dat
      writeConfig(config)
      cb(null, dat)
    }
  }
})
