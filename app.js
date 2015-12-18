var menubar = require('menubar')
var ipc = require('electron').ipcMain
var fs = require('fs')
var mkdirp = require('mkdirp')
var Dat = require('dat')
var path = require('path')
var dialog = require('electron').dialog
var homedir = require('os-homedir')()

var datPath = path.join(homedir, '.dat')
mkdirp.sync(datPath)
var configFile = path.join(datPath, 'config.json')
var RUNNING = {}

var mb = menubar({
  dir: __dirname,
  icon: path.join(__dirname, 'static', 'images', 'dat-icon.png'),
  width: 280
})

mb.on('ready', function ready () {
  console.log('ready')
})

process.on('uncaughtException', function (err) {
  dialog.showErrorBox('Uncaught Exception: ' + err.message, err.stack || '')
  mb.app.quit()
})

mb.on('show', function show () {
  app.configure(mb.window.webContents)
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
    var code = dialog.showMessageBox({
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

mb.on('ready', function ready () {
  configure()

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

  function download (dat, cb) {
    var config = loadConfig()
    var db = Dat(dat.path)
    db.download(dat.link, done)

    function done (err, link, port, close) {
      RUNNING[dat.path] = close
      dat.active = true
      dat.date = Date.now()
      config.dats[dat.path] = dat
      writeConfig(config)
      cb(null, dat)
    }
  }

  function restart (dat, cb) {
    stop(dat, function (err, dat) {
      if (err) throw err
      start(dat, cb)
    })
  }

  function start (dat, cb) {
    if (RUNNING[dat.path]) return restart(dat, cb)
    var config = loadConfig()
    var db = Dat(dat.path)
    db.share(done)

    function done (err, link, port, close) {
      if (err) return cb(err)
      RUNNING[dat.path] = close
      dat.link = link
      dat.active = true
      dat.date = Date.now()
      config.dats[dat.path] = dat
      writeConfig(config)
      cb(null, dat)
    }
  }

  function stop (dat, cb) {
    var config = loadConfig()
    var close = RUNNING[dat.path]
    if (close) close(done)
    else done()

    function done (err) {
      if (err) return cb(err)
      RUNNING[dat.path] = undefined
      dat.active = false
      console.log('closing', dat)
      config.dats[dat.path] = dat
      writeConfig(config)
      cb(null, dat)
    }
  }

  function configure () {
    var conf = loadConfig()
    var keys = Object.keys(conf.dats)
    for (var i = 0; i < keys.length; i++) {
      var dat = conf.dats[keys[i]]
      if (dat.active) {
        start(dat, function (err, dat) {
          if (err) throw err
          console.log('Started', dat.link)
        })
      }
    }
  }
})
