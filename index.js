var path = require('path')
var fs = require('fs')
var Ractive = require('ractive-toolkit')
var remote = require('electron').remote
var Menu = remote.Menu
var MenuItem = remote.MenuItem

var IMG_PATH = path.join(__dirname, 'static', 'images')

function getDats (cb) {
  var dats = [
    {
      path: '/Users/karissa/dats/eukaryota',
      updated: Date.now(),
      active: true
    },
    {
      path: '/Users/karissa/dats/eukaryota',
      updated: new Date(123423422342),
      active: false
    }
  ]
  return dats
}

Ractive({
  el: '#container',
  template: fs.readFileSync(path.join(__dirname, './templates/list.html')).toString(),
  data: {dats: getDats(), IMG_PATH: IMG_PATH},
  onrender: function () {
    var self = this
    self.on('toggle', function (event, i) {
      var dats = self.get('dats')
      dats[i].active = !dats[i].active
      self.set('dats', dats)
    })

    self.on('share', function (event, i) {
      var dat = self.get('dats')[i]
      // get hash.. then..
      shared('abd3234sdf')
    })

    self.on('info', function (event, i) {
      var dat = self.get('dats')[i]
      alert(dat)
    })

    var menu = new Menu();
    menu.append(new MenuItem({ label: 'Create Share link', click: function() { self.fire('share') } }))

    var rows = document.getElementsByClassName('row')
    for (var i = 0; i < rows.length; i++) {
      var item = rows[i]
      item.addEventListener('contextmenu', function (e) {
        e.preventDefault()
        menu.popup(remote.getCurrentWindow())
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
    self.on('settings', function (event) {
      console.log('settings open')
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
