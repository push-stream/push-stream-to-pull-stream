var k = 0

module.exports = function (push, length) {
  var id = ++k
  var abort_cb, ended, buffer = [], _cb
  length = length || 0
  var adapter = {
    paused: false,
    write: function (data) {
      console.log('WRITE', id, data, !!_cb)
      if(_cb) {
        var cb = _cb; _cb = null; cb(null, data)
      }
      else {
        buffer.push(data)
        if(buffer.length > length)
          this.paused = true
      }
    },
    end: function (err) {
      ended = err || true
      if(_cb && (err || !buffer.length)) {
        var cb = _cb; _cb = null; cb(ended)
        if(!_cb) this.paused = true
      }
    }
  }

  push.pipe(adapter)

  return function (abort, cb) {
    console.log('READ', id, ended, buffer.length, !!_cb)
    if(_cb && !abort) throw new Error('read twice')

    if(abort) {
      push.abort(abort)
      abort_cb = cb
    }
    //if it ended with an error, cb immedately, dropping the buffer
    else if(ended && ended !== true)
      cb(ended)
    //else read the buffer
    else if(buffer.length) {
      var data = buffer.shift()
      cb(null, data)
      if(buffer.length <= length/2 && adapter.paused) {
        adapter.paused = false
        push.resume()
      }
    }
    else if(ended === true)
      cb(true)
    else {
      console.log('remember_cb', id)
      _cb = cb
    }
  }
}







