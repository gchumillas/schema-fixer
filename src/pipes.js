const { pipe } = require('./core/pipe')

const text = pipe((value, { coerce, require }) => {
  if (typeof value == 'string') {
    if (require && !value) {
      throw 'required'
    }

    return value
  } else if (coerce && ['boolean', 'number'].includes(typeof value)) {
    return `${value}`
  }

  throw 'not a string'
}, { default: '', coerce: true })

const float = pipe((value, { coerce }) => {
  if (typeof value == 'number') {
    return value
  } else if (coerce && !isNaN(value)) {
    return +value
  }

  throw 'not a number'
}, { default: 0, coerce: true })

module.exports = { text, float }
