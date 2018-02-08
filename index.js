var duplex = require('./duplex')
var source = require('./source')
var sink = require('./sink')

function duplex (push) {
  return {
    source: toSource(push),
    sink: toSink(push)
  }
}

function transform (push) {
  return function (read) {
    var reader = source(push)
    sink(push)(read)
    return reader
  }
}

exports = module.exports = function (push) {
  if(push.write && push.resume)
    return duplex(push)
  else if(push.write && !push.resume)
    return sink(push)
  else
    return source(push)
}

exports.source = source
exports.sink = sink
exports.duplex = duplex
exports.transform = transform

