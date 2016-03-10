var bel = require('bel')

module.exports = function (items, onselected) {
  return bel`<div class="content configure-content">
    <ul class="table-view">
      ${items.map(function (item) {
        return bel`<li class="table-view-cell media">${button(item.id, item.label)}</li>`
      })}
    </ul>
  </div`

  function button (id, label) {
    return bel`<a class="navigate-right" onclick=${function () { onselected(id) }}>
      <button class="btn btn-outlined"><span class="media-object pull-left octicon octicon-clippy"></span></button>
      ${label}
    </a>`
  }
}
