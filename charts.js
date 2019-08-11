var moment = require('moment')

function hrChart (bpm) {
  return new window.Chartist.Line('.ct-chart', {
    series: [
      {
        name: 'bpm-max',
        data: bpm.map(({ time, max }) => {
          return {
            x: time,
            y: max
          }
        })
      },
      {
        name: 'bpm-min',
        data: bpm.map(({ time, min }) => {
          return {
            x: time,
            y: min
          }
        })
      },
      {
        name: 'bpm-mean',
        data: bpm.map(({ time, mean }) => {
          return {
            x: time,
            y: mean
          }
        })
      }
    ]
  }, {
    low: 25,
    high: 175,
    axisX: {
      type: window.Chartist.FixedScaleAxis,
      divisor: 24,
      labelInterpolationFnc: function (value) {
        return moment(value).format('ha')
      }
    },
    series: {
      'bpm-max': { showPoint: false },
      'bpm-min': { showPoint: false }
    }
  })
}

module.exports = { hrChart }
