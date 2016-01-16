var Client = require('electron-rpc/client')
var client = new Client()

var dat = require('dat')
var Manager = {}

Manager.download = function (data, cb) {
  client.request('download', data, function (err, data) {
    if (err) return cb(err)
    var db = dat()
    db.joinWebrtcSwarm(data.link)
    return cb(null, data)
  })
}

Manager.share = function (data, cb) {
  client.request('share', data, function (err, data) {
    if (err) return cb(err)
    var db = dat()
    db.joinWebrtcSwarm(data.link)
    return cb(null, data)
  })
}

module.exports = Manager
