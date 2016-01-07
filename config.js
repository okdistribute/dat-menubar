var fs = require('fs')
var electron = require('electron')

module.exports = Config

function Config (loc) {
  if (!(this instanceof Config)) return new Config(loc)
  this.loc = loc
  this.dats = {}
}

Config.prototype.update = function (dat, cb) {
  this.dats[dat.path] = dat
  this.write(cb)
}

Config.prototype.get = function (key) {
  return this.dats[key]
}

Config.prototype.del = function (key, cb) {
  delete this.dats[key]
  this.write(cb)
}

Config.prototype.read = function () {
  var self = this
  var data, conf
  try {
    data = fs.readFileSync(self.loc)
  } catch (e) {
    if (e.code === 'ENOENT') {
      self.write()
      return self.read()
    } else {
      throw e
    }
  }

  try {
    conf = JSON.parse(data.toString())
  } catch (e) {
    var code = electron.dialog.showMessageBox({
      message: 'Invalid configuration file\nCould not parse JSON',
      detail: e.stack,
      buttons: ['Reload Config', 'Exit app']
    })
    if (code === 0) {
      return self.read()
    } else {
      throw e
    }
  }

  self.dats = conf.dats
  console.log('config', self.dats)
  return conf.dats
}

Config.prototype.write = function (cb) {
  var self = this
  var data = JSON.stringify({dats: self.dats}, null, 2)
  fs.writeFile(self.loc, data, cb)
}
