var toSource = require('./source')
var toSink = require('./sink')

module.exports = function (push) {
  return {
    source: toSource(push),
    sink: toSink(push)
  }
}
