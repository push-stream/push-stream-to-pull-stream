'use strict'

module.exports = function (push) {
  var reading = false, ended, read

  var adapter = push.source = {
    resume: more,
    paused: false,
    abort: function (err) {
      read(err || true, function (err) {
        if(!push.ended) push.end(err)
      })
    }
  }

  function more () {
    if(reading) return
    if(!(adapter.paused = push.paused)) {
      reading = true
      read(null, function next (err, data) {
        reading = false
        if(err && err !== true) {
          push.end(ended = err)
        } else {
          if(err) push.end(err)
          else push.write(data)

          if(!push.paused && !err && !reading) more()
        }
      })
    }
  }

  return function (_read) {
    read = _read
    if(!push.paused) more()
  }

}












