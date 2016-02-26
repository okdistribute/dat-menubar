var path = require('path')
var dragDrop = require('drag-and-drop-files')
var shell = require('shell')
var electron = require('electron')
var fs = require('fs')
var Ractive = require('ractive-toolkit')
var remote = require('remote')

var ipc = electron.ipcRenderer
var dialog = remote.dialog
var Menu = remote.Menu
var MenuItem = remote.MenuItem

var Client = require('electron-rpc/client')
var client = new Client()

client.request('dats', function (err, dats) {
  if (err) return onerror(err)
  render(dats)
})

var IMG_PATH = path.join(__dirname, 'images')

function render (dats) {
  Ractive({
    el: '#container',
    template: fs.readFileSync(path.join(__dirname, 'templates', 'list.html')).toString(),
    data: {dats: dats, IMG_PATH: IMG_PATH},
    onrender: function () {
      var self = this

      function update () {
        client.request('dats', function (err, dats) {
          if (err) return onerror(err)
          self.set('dats', dats)
        })
      }

      ipc.on('share', function (event, location) {
        self.fire('share', location)
      })

      ipc.on('download', function (event, link) {
        downloadButton(link)
      })

      ipc.on('error', function (event, message) {
        alert(message)
      })

      dragDrop(document.querySelector('#content'), function (files) {
        self.fire('share', files[0])
      })

      self.on('share', function (event, location) {
        if (!location) location = event
        add({
          state: 'loading',
          location: location,
          name: location
        })
        console.log('sharing', location)
        client.request('share', {location: location}, function (err, dat) {
          if (err) return onerror(err)
          copy(dat.value.link)
          update()
        })
      })

      self.on('start', function (event, name) {
        if (!name) {
          name = event
        } else {
          event.original.preventDefault()
          event.original.stopPropagation()
        }
        var dat = get(name)
        dat.value.state = 'loading'
        client.request('start', {name: name}, function (err, dat) {
          if (err) return onerror(err)
          copy(dat.value.link)
          update()
        })
      })

      function copy (link) {
        electron.clipboard.writeText(link)
        var message = {
          title: 'Dat',
          message: 'A link has been copied to your clipboard.'
        }
        client.request('notify', message)
      }

      self.on('stop', function (event, name) {
        if (!name) name = event
        var dat = get(name)
        dat.value.state = 'loading'
        client.request('stop', {name: name}, function (err, dat) {
          if (err) return onerror(err)
          update()
        })
      })

      self.on('delete', function (event, name) {
        if (!name) {
          name = event
        } else {
          event.original.preventDefault()
          event.original.stopPropagation()
        }
        var dat = get(name)
        dat.value.state = 'loading'
        client.request('delete', {name: name}, function (err, dat) {
          if (err) return onerror(err)
          update()
        })
      })

      self.on('open', function (event, path) {
        shell.openItem(path)
        ipc.send('hide')
      })

      self.on('actions', function (event, name) {
        var actionMenu = new Menu()
        var dat = get(name)
        actionMenu.append(new MenuItem({ label: 'Copy link', click: function () {
          copy(dat.value.link)
        }}))

        if (dat.value.state !== 'inactive') {
          actionMenu.append(new MenuItem({ label: 'Stop sharing', click: function () {
            self.fire('stop', dat.key)
          }}))
        }
        actionMenu.popup(electron.remote.getCurrentWindow())
        event.original.preventDefault()
      })

      var settings = new Menu()
      settings.append(new MenuItem({ label: 'Stop sharing and quit', click: function () { ipc.send('quit') } }))
      self.on('settings', function (event) {
        event.original.preventDefault()
        settings.popup(electron.remote.getCurrentWindow())
      })

      self.on('add', function (event) {
        var opts = {properties: [ 'openDirectory' ]}
        dialog.showOpenDialog(opts, function (directories) {
          if (!directories) return
          self.fire('share', directories[0])
        })
      })

      self.on('close', function (event, selector) {
        document.querySelector(selector).classList.remove('open')
      })

      self.on('download', function (event) {
        event.original.preventDefault()
        var link = self.get('link')
        downloadButton(link)
      })

      function downloadButton (link) {
        if (!link) return
        var dialogOpts = {
          title: 'Download location.',
          properties: [ 'openDirectory' ]
        }
        dialog.showOpenDialog(dialogOpts, function (directories) {
          if (!directories) return
          var downloadBox = document.querySelector('#download')
          downloadBox.classList.remove('open')
          var location = directories[0]
          add({
            link: link,
            location: location,
            state: 'loading'
          })
          client.request('download', {link: link, location: location}, function (err) {
            if (err) return onerror(err)
            update()
          })
        })
      }

      function add (dat) {
        if (!dat.value) {
          dat = {
            key: dat.key || dat.location,
            value: dat
          }
        }
        var dats = self.get('dats')
        dats.push(dat)
        self.set('dats', dats)
      }

      function get (name) {
        var dats = self.get('dats')
        for (var i = 0; i < dats.length; i++) {
          if (dats[i].key === name) return dats[i]
        }
      }
    }
  })
}

function onerror (error) {
  var message = error.stack || error.message || JSON.stringify(error)
  console.error(message)
  window.alert(message)
}

// Throw unhandled javascript errors
window.onerror = function errorHandler (message, url, lineNumber) {
  message = message + '\n' + url + ':' + lineNumber
  onerror(message)
}
