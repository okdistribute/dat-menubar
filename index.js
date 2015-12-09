var path = require('path')
var dragDrop = require('drag-drop')
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
    name: 'karissa/cfpb',
    path: '/Users/karissa/dev/dats/cfpb',
    date: Date.now(),
    active: true
  },
  {
    name: 'sunlight/elections',
    path: '/Users/karissa/Dropbox/dats/elections',
    date: new Date(123423422342),
    active: true
  }
]

Ractive({
  el: '#container',
  template: fs.readFileSync(path.join(__dirname, './templates/list.html')).toString(),
  data: {dats: dats, IMG_PATH: IMG_PATH},
  onrender: function () {
    var self = this

    dragDrop('.content', function (files, pos) {
      var file = files[0]
      dats.push(Dat({path: file}))
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
          dats.push(Dat({path: file}))
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
    contextMenu.append(new MenuItem({ label: 'Copy link', click: function () { self.fire('share') } }))
    contextMenu.append(new MenuItem({ label: 'Copy path', click: function () { self.fire('share') } }))
    contextMenu.append(new MenuItem({ label: 'Publish new version', click: function () { self.fire('publish') } }))

    var rows = document.getElementsByClassName('row')
    for (var i = 0; i < rows.length; i++) {
      var item = rows[i]
      item.addEventListener('contextmenu', function (e) {
        e.preventDefault()
        contextMenu.popup(electron.remote.getCurrentWindow())
      })
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
    settings.append(new MenuItem({ label: 'Debug' }))
    settings.append(new MenuItem({ label: 'Stop sharing and quit', click: function () { ipc.send('terminate') } }))
    self.on('settings', function (event) {
      event.original.preventDefault()
      settings.popup(electron.remote.getCurrentWindow())
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

function Dat (data) {
  if (!data.path) throw new Error('Path required.')
  return {
    name: data.name || path.basename(data.path),
    path: data.path,
    active: data.active || true,
    date: data.date || Date.now()
  }
}
