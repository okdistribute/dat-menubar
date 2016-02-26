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

      ipc.on('update', function (event, dats) {
        self.set('dats', dats)
      })

      ipc.on('start', function (event, path) {
        start({location: path}, {copy: true})
      })

      ipc.on('download', function (event, link) {
        downloadButton(link)
      })

      ipc.on('error', function (event, message) {
        alert(message)
      })

      dragDrop(document.querySelector('#content'), function (files) {
        start({location: files[0]})
      })

      function update (dat) {
        dats[dat.location] = dat
        self.set('dats', dats)
      }

      function stop (dat) {
        dat = normalize(dat)
        client.request('stop', dat, function (err, dat) {
          if (err) return onerror(err)
          update(dat)
        })
      }

      function del (dat) {
        dat = normalize(dat)
        client.request('delete', dat, function (err, dat) {
          if (err) return onerror(err)
          delete dats[dat.path]
          self.set('dats', dats)
        })
      }

      self.on('start', function (event, location) {
        start(dats[location], {copy: true})
        event.original.preventDefault()
        event.original.stopPropagation()
      })

      function loading (dat) {
        dat.state = 'loading'
        update(dat)
      }

      function start (dat, opts, cb) {
        dat = normalize(dat)
        loading(dat)
        client.request('start', dat, function (err, data) {
          if (err) return onerror(err)
          update(dat)
          if (opts.copy) copy(dat)
          if (cb) cb(null, dat)
        })
      }

      function copy (dat) {
        electron.clipboard.writeText(dat.link)
        var message = {
          title: 'Link copied!',
          message: dat.link
        }
        client.request('notify', message)
      }

      self.on('open', function (event, path) {
        shell.openItem(path)
        ipc.send('hide')
      })

      self.on('actions', function (event, location) {
        var actionMenu = new Menu()
        var dat = dats[location]
        if (dat.state !== 'inactive') {
          actionMenu.append(new MenuItem({ label: 'Stop sharing', click: function () {
            stop(dat)
          }}))
        }
        actionMenu.append(new MenuItem({ label: 'Remove from list', click: function () {
          del(dat)
        }}))
        actionMenu.popup(electron.remote.getCurrentWindow())
        event.original.preventDefault()
      })

      var settings = new Menu()
      // settings.append(new MenuItem({ label: 'Debug' }))
      settings.append(new MenuItem({ label: 'Stop sharing and quit', click: function () { ipc.send('quit') } }))

      self.on('settings', function (event) {
        event.original.preventDefault()
        settings.popup(electron.remote.getCurrentWindow())
      })

      var addMenu = new Menu()
      addMenu.append(new MenuItem({ label: 'Download from link', click: function () {
        var downloadBox = document.querySelector('#download')
        downloadBox.classList.add('open')
      }}))
      addMenu.append(new MenuItem({ label: 'Share...', click: addButton }))

      // for adding a new share
      self.on('add', function (event) {
        event.original.preventDefault()
        addMenu.popup(electron.remote.getCurrentWindow())
      })

      function addButton () {
        var opts = {properties: [ 'openDirectory' ]}
        dialog.showOpenDialog(opts, function (directories) {
          if (!directories) return
          start({location: directories[0]}, {copy: true})
        })
      }

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
          start({link: link, location: directories[0]})
          self.set('link', '')
        })
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

function normalize (data) {
  return {
    name: data.name || path.basename(data.path),
    location: data.location,
    state: data.state || 'active',
    link: data.link || undefined,
    date: data.date || Date.now() // TODO: grab most recent mtime from the files
  }
}
