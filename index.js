var path = require('path')
var shell = require('shell')
var electron = require('electron')
var ipc = require('ipc')
var fs = require('fs')
var Ractive = require('ractive-toolkit')

var dialog = electron.remote.dialog
var Menu = electron.remote.Menu
var MenuItem = electron.remote.MenuItem

var IMG_PATH = path.join(__dirname, 'static', 'images')

var dats = [
  {
    path: '/Users/karissa/dev/dats/cfpb',
    updated: Date.now(),
    active: true
  },
  {
    path: '/Users/karissa/Dropbox/dats/elections',
    updated: new Date(123423422342),
    active: true
  }
]

Ractive({
  el: '#container',
  template: fs.readFileSync(path.join(__dirname, './templates/list.html')).toString(),
  data: {dats: dats, IMG_PATH: IMG_PATH},
  onrender: function () {
    var self = this

    var dragDrop = require('drag-drop')

    dragDrop('.content', function (files, pos) {
      var file = files[0]
      dats.push({path: file.path, active: true, updated: Date.now()})
    })
    self.on('toggle', function (event, i) {
      dats[i].active = !dats[i].active
      self.set('dats', dats)
      event.original.preventDefault()
      event.original.stopPropagation()
    })

    self.on('add', function (event) {
      var opts = { properties: [ 'openFile', 'openDirectory' ] }
      dialog.showOpenDialog(opts, function (files) {
        if (!files) return
        files.map(function (file) {
          dats.push({path: file, active: true, updated: Date.now()})
        })
      })
    })

    self.on('share', function (event, i) {
      var dat = self.get('dats')[i]
      event.original.preventDefault()
      event.original.stopPropagation()
    })

    self.on('open', function (event, i) {
      var dat = dats[i]
      shell.openItem(dat.path)
      ipc.send('hide')
    })

    self.on('info', function (event, i) {
      var dat = dats[i]
      console.log(dat)
    })

    var contextMenu = new Menu()
    contextMenu.append(new MenuItem({ label: 'Create Share link', click: function () { self.fire('share') } }))

    var rows = document.getElementsByClassName('row')
    for (var i = 0; i < rows.length; i++) {
      var item = rows[i]
      item.addEventListener('contextmenu', function (e) {
        e.preventDefault()
        contextMenu.popup(remote.getCurrentWindow())
      })
    }

    function shared (hash) {

    }
  }
})

Ractive({
  el: '#footer',
  template: fs.readFileSync(path.join(__dirname, './templates/footer.html')).toString(),
  data: {IMG_PATH: IMG_PATH},
  onrender: function () {
    var self = this
    var settings = new Menu()
    settings.append(new MenuItem({ label: 'View logs' }))
    settings.append(new MenuItem({ label: 'Stop sharing and quit', click: function () { ipc.send('terminate') } }))
    self.on('settings', function (event) {
      event.original.preventDefault()
      settings.popup(remote.getCurrentWindow())
    })
  }
})

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
