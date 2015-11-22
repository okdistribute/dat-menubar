var path = require('path')
var fs = require('fs')
var Ractive = require('ractive-toolkit')

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
