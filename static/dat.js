var path = require('path')

function Dat (data) {
  if (!(this instanceof Dat)) return new Dat(data)
  this.data = {
    name: data.name || path.basename(data.path),
    path: data.path,
    state: data.state || 'active',
    link: data.link || undefined,
    date: data.date || Date.now() // TODO: grab most recent mtime from the files
  }
}

Dat.prototype.share = function () {

}
