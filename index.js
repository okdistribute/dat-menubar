var path = require('path')
var fs = require('fs')
var Ractive = require('ractive-toolkit')

function getDats (cb) {
  var dats = [
    {
      path: '/Users/karissa/dats/eukaryota',
      updated: Date.now()
    }
  ]
  return dats
}

function render (ctx) {
  var ract = new Ractive({
    el: '#container',
    template: ctx.template,
    data: ctx.data,
    onrender: ctx.onrender
  })
  return ract
}
render({
  template: fs.readFileSync(path.join(__dirname, './templates/list.html')).toString(),
  data: {dats: getDats()},
  onrender: function () {
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
