
module.exports = function (push) {
  var reading = false

  push.source = {
    resume: more,
    paused: false,
    abort: function (err) {
      read(err || true, function (err) {
        if(!push.ended) push.end(err)
      })
    }
  }

  function more () {
    console.log('RESUME', reading)
    if(reading) return
    push.source.paused = false
    reading = true
    read(null, function next (err, data) {
      reading = false
      if(err && err !== true)
        push.end(err)
      else if(!push.paused) {
        if(err) push.end(err)
        else push.write(data)

        if(!push.paused && !err) more()
      }
    })
  }

  return function (_read) {
    read = _read
    if(!push.paused) more()
  }

}


