var html = require('choo/html')
var devtools = require('choo-devtools')
var choo = require('choo')
var { auth, getHRDay, getSleepDay } = require('./api')
var { hrChart, sleepChart } = require('./charts')

var app = choo()
app.use(devtools())
app.use(globalStore)
app.route('/', mainView)
app.mount('#choo')

function loadData (emitter) {
  Promise.all([
    getHRDay(),
    getSleepDay()
  ]).then(data => {
    emitter.emit('receiveData', {
      bpm: data[0],
      cycles: data[1]
    })
  })
}

function mainView (state, emit) {
  return html`
    <div>
      <div class="ct-chart ct-chart-hr ct-major-eleventh"></div>
      <div class="ct-chart ct-chart-sleep ct-major-eleventh"></div>
    </div>
  `
}

function globalStore (state, emitter) {
  emitter.on('DOMContentLoaded', function () {
    auth(() => {
      loadData(emitter)
    })
  })

  emitter.on('receiveData', function ({ bpm, cycles }) {
    hrChart(bpm)
    sleepChart(cycles)
  })
}
