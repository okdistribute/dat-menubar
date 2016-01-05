var fs = require('fs')
var electron = require('electron')
var path = require('path')

module.exports = Config

function Config (loc) {
  if (!(this instanceof Config)) return new Config(loc)
  this.loc = loc
  this.dats = []
}

Config.prototype.update = function (dat) {
  this.dats[dat.path] = dat
  this.write()
}

Config.prototype.get = function (key) {
  return this.dats[key]
}

Config.prototype.del = function (key) {
  delete this.dats[key]
  this.write()
}

Config.prototype.read = function () {
  var self = this
  var data, conf
  try {
    data = fs.readFileSync(self.loc)
  } catch (e) {
    if (e.code === 'ENOENT') {
      var defaultConfig = fs.readFileSync(path.join(__dirname, 'config.json')).toString()
      self.write(defaultConfig)
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
  return conf
}

Config.prototype.write = function () {
  fs.writeFileSync(this.loc, JSON.stringify({dats: this.dats}, null, 2))
}
