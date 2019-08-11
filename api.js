var moment = require('moment')

function auth (cb) {
  window.gapi.load('client:auth2', () => {
    window.gapi.client.init({
      'apiKey': 'AIzaSyAUuoO9LXqbj3EJmsz_kILFypfzM9x1gcw',
      // Your API key will be automatically added to the Discovery Document URLs.
      // clientId and scope are optional if auth is not required.
      'clientId': '120751711912-853op0a94ge3o3v3792662rmpu7e9lvj.apps.googleusercontent.com',
      'scope': 'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read'
    }).then(function () {
      const instance = window.gapi.auth2.getAuthInstance()
      const isSignedIn = instance.isSignedIn.get()
      if (!isSignedIn) {
        instance.signIn().then(() => cb())
      } else {
        cb()
      }
    })
  })
}

function getHR (startTime, endTime, bucketByTime) {
  return window.gapi.client.request({
    method: 'POST',
    path: 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
    body: {
      aggregateBy: [{
        dataTypeName: 'com.google.heart_rate.bpm',
        dataSourceId: 'raw:com.google.heart_rate.bpm:nl.appyhapps.healthsync:HealthSync - heart rate'
      }],
      bucketByTime: { durationMillis: bucketByTime },
      startTimeMillis: startTime,
      endTimeMillis: endTime
    }
  }).then(res => {
    return res.result.bucket.map(item => {
      const startTime = Number(item.startTimeMillis)
      const endTime = Number(item.endTimeMillis)
      const value = item &&
        item.dataset &&
        item.dataset.length &&
        item.dataset[0].point &&
        item.dataset[0].point[0] &&
        item.dataset[0].point[0].value &&
        item.dataset[0].point[0].value.length === 3 &&
        item.dataset[0].point[0].value
      const mean = value && value[0] && value[0].fpVal
      const max = value && value[1] && value[1].fpVal
      const min = value && value[2] && value[2].fpVal
      return value && {
        time: Math.round((endTime - startTime) / 2) + startTime,
        mean,
        max,
        min
      }
    }).filter(i => Boolean(i))
  })
}

function getSleep (startTime, endTime) {
  return window.gapi.client.request({
    method: 'POST',
    path: 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
    body: {
      aggregateBy: [{
        dataTypeName: 'com.google.activity.summary',
        dataSourceId: 'raw:com.google.activity.segment:nl.appyhapps.healthsync:'
      }],
      startTimeMillis: startTime,
      endTimeMillis: endTime
    }
  }).then(res => {
    const lastInBucket = res && res.result && res.result.bucket && res.result.bucket.length && res.result.bucket[res.result.bucket.length - 1]
    const points = lastInBucket && lastInBucket.dataset && lastInBucket.dataset.length && lastInBucket.dataset[0] && lastInBucket.dataset[0].point
    return points.map(point => {
      const startTime = Number(point.startTimeNanos) / 1000000
      const endTime = Number(point.endTimeNanos) / 1000000
      const cycleCode = point &&
        point.value &&
        point.value.length &&
        point.value[0] &&
        point.value[0].intVal
      let cycleString
      if (cycleCode === 109) {
        cycleString = 'light'
      } else if (cycleCode === 110) {
        cycleString = 'deep'
      } else if (cycleCode === 111) {
        cycleString = 'REM'
      } else if (cycleCode === 112) {
        cycleString = 'awake'
      }
      return cycleString && {
        startTime,
        endTime,
        cycle: cycleString
      }
    }).filter(i => Boolean(i))
  })
}

function getHRDay () {
  const msPerHour = 3600000
  const startTime = moment().startOf('day').subtract(30, 'minutes')
  const endTime = startTime.clone().add(1, 'day')
  return getHR(startTime.valueOf(), endTime.valueOf(), msPerHour)
}

function getSleepDay () {
  const startTime = moment().startOf('day').subtract(30, 'minutes')
  const endTime = startTime.clone().add(1, 'day')
  return getSleep(startTime.valueOf(), endTime.valueOf())
}

module.exports = { auth, getHRDay, getSleepDay }
