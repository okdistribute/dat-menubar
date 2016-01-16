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

var Manager = require('./dat.js')

client.request('dats', function (dats) {
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

      ipc.on('share', function (event, path) {
        var dat = Dat({path: path})
        share(dat, {copy: true})
      })

      ipc.on('download', function (event, link) {
        downloadButton(link)
      })

      ipc.on('error', function (event, message) {
        alert(message)
      })

      dragDrop(document.querySelector('#content'), function (files) {
        var file = files[0]
        var dat = Dat(dat, {path: file.path})
        update(dat)
      })

      function update (dat) {
        dats[dat.path] = dat
        self.set('dats', dats)
      }

      function stop (dat) {
        client.request('stop', dat, function (err, dat) {
          if (err) return onerror(err)
          update(dat)
        })
      }

      function del (dat) {
        client.request('remove', dat, function (err, dat) {
          if (err) return onerror(err)
          delete dats[dat.path]
          self.set('dats', dats)
        })
      }

      self.on('share', function (event, path) {
        share(dats[path], {copy: true})
        event.original.preventDefault()
        event.original.stopPropagation()
      })

      function loading (dat) {
        dat.state = 'loading'
        update(dat)
      }

      function share (dat, opts) {
        loading(dat)
        Manager.share(dat, function (err, dat) {
          if (err) return onerror(err)
          if (opts.copy) copy(dat)
          update(dat)
        })
      }

      function download (dat) {
        loading(dat)
        Manager.download(dat, function (err, dat) {
          if (err) return onerror(err)
          update(dat)
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

      self.on('actions', function (event, path) {
        var actionMenu = new Menu()
        var dat = dats[path]
        console.log(dat)
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
          var dat = Dat({path: directories[0]})
          share(dat, {copy: true})
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
          var dat = Dat({link: link, path: directories[0]})
          download(dat)
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

function Dat (data) {
  return {
    name: data.name || path.basename(data.path),
    path: data.path,
    state: data.state || 'active',
    link: data.link || undefined,
    date: data.date || Date.now() // TODO: grab most recent mtime from the files
  }
}
