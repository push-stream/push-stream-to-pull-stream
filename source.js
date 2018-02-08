'use strict'

module.exports = function (push, length) {
  var abort_cb, ended, buffer = [], _cb
  length = length || 0

  var adapter = {
    paused: false,
    write: function (data) {
      if(_cb) {
        var cb = _cb; _cb = null; cb(null, data)
      }
      else {
        buffer.push(data)
        if(buffer.length > length) {
          adapter.paused = true
        }
      }
    },
    end: function (err) {
      ended = err || true
      if(_cb && (err || !buffer.length)) {
        var cb = _cb; _cb = null; cb(ended)
        if(!_cb) this.paused = true
      }
    },
    source: null
  }

  push.pipe(adapter)

  return function (abort, cb) {
    if(_cb && !abort) {
      throw new Error('source:read twice')
    }

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
    else if(ended === true) cb(true)
    else _cb = cb
  }
}

