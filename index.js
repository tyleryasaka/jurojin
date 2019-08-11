var html = require('choo/html')
var devtools = require('choo-devtools')
var choo = require('choo')
var { auth, getHRDay } = require('./api')
var { hrChart } = require('./charts')

var app = choo()
app.use(devtools())
app.use(globalStore)
app.route('/', mainView)
app.mount('#choo')

function loadData (emitter) {
  Promise.all([
    getHRDay()
  ]).then(data => {
    emitter.emit('receiveData', {
      bpm: data[0]
    })
  })
}

function mainView (state, emit) {
  return html`
    <div class="ct-chart ct-perfect-fourth"></div>
  `
}

function globalStore (state, emitter) {
  emitter.on('DOMContentLoaded', function () {
    auth(() => {
      loadData(emitter)
    })
  })

  emitter.on('receiveData', function ({ bpm }) {
    console.log('bpm', bpm)
    hrChart(bpm)
  })
}
