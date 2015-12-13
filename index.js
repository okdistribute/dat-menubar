var path = require('path')
var dragDrop = require('drag-and-drop-files')
var shell = require('shell')
var electron = require('electron')
var ipc = require('ipc')
var fs = require('fs')
var Ractive = require('ractive-toolkit')
var menu = require('./menu.js')(Ractive)

var dialog = electron.remote.dialog
var Menu = electron.remote.Menu
var MenuItem = electron.remote.MenuItem

var Client = require('electron-rpc/client')
var client = new Client()

client.request('dats', function (dats) {
  console.log(dats)
  render(dats)
})

var IMG_PATH = path.join(__dirname, 'static', 'images')

function render (dats) {
  Ractive({
    el: '#container',
    template: fs.readFileSync(path.join(__dirname, './templates/list.html')).toString(),
    data: {dats: dats, IMG_PATH: IMG_PATH},
    onrender: function () {
      var self = this

      function notify (type, message) {
        self.set('notify', {type: type, message: message})
        setTimeout(function () {
          self.set('notify', {type: '', message: ''})
        }, 2000)
      }

      dragDrop(document.querySelector('#content'), function (files) {
        var file = files[0]
        var dat = Dat({path: file.path})
        dats[dat.path] = dat
        self.set('dats', dats)
      })

      self.on('stop', function (event, path) {
        client.request('stop', dats[path], function (err, dat) {
          if (err) throw err
          dats[path] = dat
          self.set('dats', dats)
        })
        event.original.preventDefault()
        event.original.stopPropagation()
      })

      self.on('share', function (event, path) {
        share(path)
        event.original.preventDefault()
        event.original.stopPropagation()
      })

      self.on('open', function (event, path) {
        shell.openItem(path)
        ipc.send('hide')
      })

      self.on('actions', function (event, path) {
        var contextMenu = new Menu()
        contextMenu.append(new MenuItem({ label: 'Copy link', click: function () {
          var dat = dats[path]
          copy(dat)
        }}))
        event.original.preventDefault()
        contextMenu.popup(electron.remote.getCurrentWindow())
      })

      var settings = new Menu()
      settings.append(new MenuItem({ label: 'Debug' }))
      settings.append(new MenuItem({ label: 'Stop sharing and quit', click: function () { ipc.send('quit') } }))

      self.on('settings', function (event) {
        event.original.preventDefault()
        settings.popup(electron.remote.getCurrentWindow())
      })

      self.on('add', function (event) {
        var opts = { properties: [ 'openFile', 'openDirectory' ] }
        dialog.showOpenDialog(opts, function (files) {
          if (!files) return
          console.log(files)
          files.map(function (file) {
            var dat = Dat({path: file})
            dats[dat.path] = dat
            self.set('dats', dats)
            share(dat.path)
          })
        })
      })

      function share (path) {
        client.request('start', dats[path], function (err, dat) {
          if (err) return console.error(err)
          dats[path] = dat
          copy(dat)
          self.set('dats', dats)
        })
      }

      function copy (dat) {
        electron.clipboard.writeText(dat.link)
        notify('success', 'Link Copied')
      }
    }
  })
}

function throwError (error) {
  var message = error.stack || error.message || JSON.stringify(error)
  console.error(message)
  window.alert(message)
}

// Throw unhandled javascript errors
window.onerror = function errorHandler (message, url, lineNumber) {
  message = message + '\n' + url + ':' + lineNumber
  throwError(message)
}

function Dat (data) {
  if (!data.path) throw new Error('Path required.')
  return {
    name: data.name || path.basename(data.path),
    path: data.path,
    active: data.active || true,
    date: data.date || Date.now()
  }
}
