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

function getHR (duration, bucketByTime) {
  const now = new Date().getTime()
  const startTime = now - duration
  return window.gapi.client.request({
    method: 'POST',
    path: 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
    body: {
      aggregateBy: [{
        dataTypeName: 'com.google.heart_rate.bpm',
        dataSourceId: 'derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm'
      }],
      bucketByTime: { durationMillis: bucketByTime },
      startTimeMillis: startTime,
      endTimeMillis: now
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

function getHRDay () {
  const msPerHour = 3600000
  const msPerDay = 86400000
  return getHR(msPerDay, msPerHour)
}

module.exports = { auth, getHRDay }
