var csjs = require('csjs-inject')
var yo = require('yo-yo')
var styles = css()

module.exports = function () {
  return yo`<div class="${styles.spinner}">
    <div></div>
    <div class="${styles.rect2}"></div>
    <div class="${styles.rect3}"></div>
    <div class="${styles.rect4}"></div>
    <div class="${styles.rect5}"></div>
  </div>`
}

module.exports.style = styles

function css () {
  return csjs`/* spinkit */
    .spinner {
      opacity: 0;
      margin: 10px auto;
      width: 50px;
      height: 30px;
      text-align: center;
      font-size: 10px;
      animation: fadein 0.1s ease-in forwards;
      animation-delay: 1s;
    }

    .spinner > div {
      background-color: #333;
      height: 100%;
      width: 6px;
      display: inline-block;
      animation: stretchdelay 1.2s infinite ease-in-out;
    }

    .spinner .rect2 {
      animation-delay: -1.1s;
    }

    .spinner .rect3 {
      animation-delay: -1.0s;
    }

    .spinner .rect4 {
      animation-delay: -0.9s;
    }

    .spinner .rect5 {
      animation-delay: -0.8s;
    }

    @keyframes stretchdelay {
      0%, 40%, 100% {
        transform: scaleY(0.4);
      } 20% {
        transform: scaleY(1.0);
      }
    }

    @keyframes delay {
      0% {
        display: none;
      } 100% {
        display: initial;
      }
    }

    @keyframes fadein {
      0% {
        opacity:0;
      }
      100% {
        opacity:1;
      }
    }`
}
