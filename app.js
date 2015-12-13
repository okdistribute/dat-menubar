var menubar = require('menubar')
var ipc = require('electron').ipcMain
var fs = require('fs')
var mkdirp = require('mkdirp')
var dat = require('dat')
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
  width: 250
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

  app.on('start', function task (req, cb) {
    start(req.body, cb)
  })

  app.on('stop', function task (req, cb) {
    stop(req.body, cb)
  })

  function start (data, cb) {
    var config = loadConfig()
    var db = dat(data.dat.path)
    if (RUNNING[data.dat.path]) return cb(null, data.dat)
    db.share(done)

    function done (err, link, port, close) {
      if (err) return cb(err)
      RUNNING[data.dat.path] = close

      data.dat.link = link
      data.dat.active = true
      data.dat.date = Date.now()
      config.dats[data.dat.path] = data.dat
      writeConfig(config)

      cb(null, data.dat)
    }
  }

  function stop (data, cb) {
    var config = loadConfig()
    var close = RUNNING[data.dat.path]
    if (close) close(done)
    else done()
    function done (err) {
      if (err) return cb(err)
      RUNNING[data.dat.path] = undefined

      data.dat.active = false
      console.log('closing', data.dat)
      config.dats[data.dat.path] = data.dat
      writeConfig(config)

      cb(null, data.dat)
    }
  }

  function configure () {
    var conf = loadConfig()
    var keys = Object.keys(conf.dats)
    for (var i = 0; i < keys.length; i++) {
      var dat = conf.dats[keys[i]]
      if (dat.active) {
        start({dat: dat}, function (err, dat) {
          if (err) throw err
          console.log('Started', dat.link)
        })
      }
    }
  }
})
