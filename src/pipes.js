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

module.exports = { text }
