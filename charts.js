var moment = require('moment')

function hrChart (bpm) {
  const startOfToday = moment().startOf('day')
  const endOfToday = startOfToday.clone().add(1, 'day')
  return new window.Chartist.Line('.ct-chart-hr', {
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
    // low: 25,
    // high: 175,
    axisX: {
      type: window.Chartist.FixedScaleAxis,
      low: startOfToday.valueOf(),
      high: endOfToday.valueOf(),
      divisor: 6,
      labelInterpolationFnc: function (value, check) {
        return moment(value).format('ha')
      }
    },
    series: {
      'bpm-max': { showPoint: false },
      'bpm-min': { showPoint: false }
    }
  })
}

function sleepChart (cycles) {
  const startOfToday = moment().startOf('day')
  const endOfToday = startOfToday.clone().add(1, 'day')
  const genSeries = (cycleName) => {
    return {
      name: cycleName,
      data: cycles.filter(({ cycle }) => cycle === cycleName).map(({ startTime, endTime }) => {
        return [{
          x: startTime,
          y: 1
        }, {
          x: endTime,
          y: 0
        }]
      }).flat()
    }
  }
  return new window.Chartist.Line('.ct-chart-sleep', {
    series: [
      genSeries('light'),
      genSeries('deep'),
      genSeries('REM'),
      genSeries('awake')
    ]
  }, {
    // low: 25,
    // high: 175,
    axisX: {
      type: window.Chartist.FixedScaleAxis,
      low: startOfToday.valueOf(),
      high: endOfToday.valueOf(),
      divisor: 6,
      labelInterpolationFnc: function (value, check) {
        return moment(value).format('ha')
      }
    },
    axisY: {
      labelInterpolationFnc: () => {
        return false
      }
    },
    lineSmooth: window.Chartist.Interpolation.step(),
    showPoint: false,
    showArea: true,
    showLine: false
  })
}

module.exports = { hrChart, sleepChart }
