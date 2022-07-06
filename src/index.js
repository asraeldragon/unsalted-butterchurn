import Visualizer from './lib/Visualizer'
import { showError, errorToMessage } from './lib/errors'
import './style/style.css'

const init = async () => {
  // Get canvas
  const canvas = document.getElementById('render')

  const visualizerOptions = {
    width: window.innerWidth,
    height: window.innerHeight,
  }

  // Pull options out of query params -- https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  })

  // Allow any option to be specified in a URL param, translated to native types
  Object.keys(Visualizer.defaultOptions).forEach(paramName => {
    if( !params[paramName] ) { return }

    switch(typeof Visualizer.defaultOptions[paramName]) {
      case ('string'):
        visualizerOptions[paramName] = decodeURI(params[paramName])
        break
      case ('number'):
        visualizerOptions[paramName] = Number(params[paramName])
        break
      case ('boolean'):
        visualizerOptions[paramName] = params[paramName] === 'true'
        break
      default:
        showError(`Failed to handle param ${paramName} of type ${typeof paramName}`)
    }
  })

  // Init visualizer
  const visualizer = new Visualizer(visualizerOptions)

  // Init canvas
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  // Attach resize handler
  window.addEventListener('resize', () => {
    visualizer.resize(window.innerWidth, window.innerHeight)
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  })

  // Init visualizer in a frame (to let DOM settle)
  window.requestAnimationFrame(async () => {
    try {
      await visualizer.init(canvas)
    } finally {
      // Whether we failed or not, clear the message about interacting with the window.
      document.getElementById('clickHere').style.display = 'none'
    }
  })
}

document.addEventListener('DOMContentLoaded', () => {
  init().catch(err => showError('Failed to initialize: ' + errorToMessage(err)))
})

// Handle uncaught errors
window.onerror = function (msg, url, line) {
  showError("Caught[via window.onerror]: '" + msg + "' from " + url + ':' + line)
}

window.addEventListener('error', function (evt) {
  showError("Caught[via 'error' event]:  '" + evt.message + "' from " + evt.filename + ':' + evt.lineno)
})
