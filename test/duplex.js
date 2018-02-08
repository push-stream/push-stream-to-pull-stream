
var test = require('tape')
var Values = require('push-stream/values')
var Collect = require('push-stream/collect')
var pull = require('pull-stream')

var toSource = require('../source')
var toSink = require('../sink')
var toDuplex = require('../duplex')

test('simple', function (t) {
  pull(
    toSource(new Values([1,2,3])),
    toSink(new Collect(function (err, ary) {
      t.deepEqual(ary, [1,2,3])
      t.end()
    }))
  )
})

test('simple, async', function (t) {
  pull(
    toSource(new Values([1,2,3])),
    pull.asyncMap(function (data, cb) {
      setImmediate(function () {
        cb(null, data)
      })
    }),
    toSink(new Collect(function (err, ary) {
      t.deepEqual(ary, [1,2,3])
      t.end()
    }))
  )
})

function Echo () {
  return {
    write: function (data) {
      this.sink.write(data)
      this.paused = this.sink.paused
    },
    end: function (err) {
      this.sink.end(end)
    },
    resume: function () {
      this.source.resume()
    },
    paused: false,
    pipe: function (sink) {
      this.sink = sink
      sink.source = this
      if(!sink.paused && this.source)
        this.source.resume()
      return sink
    }
  }
}


test('simple, source, duplex, sink', function (t) {
  pull(
    toSource(new Values([1,2,3])),
    toDuplex(Echo()),
    toSink(new Collect(function (err, ary) {
      t.deepEqual(ary, [1,2,3])
      t.end()
    }))
  )
})

test('simple, duplex', function (t) {
  pull(
    pull.values([1,2,3]),
    toDuplex(Echo()),
    pull.collect(function (err, ary) {
      t.deepEqual(ary, [1,2,3])
      t.end()
    })
  )
})


