var path = require('path')
var dragDrop = require('drag-and-drop-files')
var shell = require('shell')
var electron = require('electron')
var ipc = require('ipc')
var fs = require('fs')
var Ractive = require('ractive-toolkit')

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

      var keys = Object.keys(dats)
      for (var i = 0; i < keys.length; i++) {
        var dat = dats[keys[i]]
        if (dat.state === 'active') {
          loading(dat)
          share(dat, {copy: false})
        }
      }

      dragDrop(document.querySelector('#content'), function (files) {
        var file = files[0]
        var dat = Dat({path: file.path})
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
        client.request('share', dat, function (err, dat) {
          if (err) return onerror(err)
          if (opts.copy) copy(dat)
          update(dat)
        })
      }

      function download (dat) {
        loading(dat)
        client.request('download', dat, function (err, dat) {
          if (err) return onerror(err)
          update(dat)
        })
      }

      function copy (dat) {
        electron.clipboard.writeText(dat.link)
        notify('success', 'Link copied')
      }

      self.on('open', function (event, path) {
        shell.openItem(path)
        ipc.send('hide')
      })

      self.on('actions', function (event, path) {
        var actionMenu = new Menu()
        var dat = dats[path]
        console.log(dat)
        if (dat.state === 'active') {
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
      settings.append(new MenuItem({ label: 'Debug' }))
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
      })
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
  if (!data.path) throw new Error('Path required.')
  return {
    name: data.name || path.basename(data.path),
    path: data.path,
    state: data.state || 'active',
    link: data.link || undefined,
    date: data.date || Date.now()
  }
}
