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

const bool = pipe((value, { coerce }) => {
  if (typeof value == 'boolean') {
    return value
  } else if (coerce) {
    return !!value
  }

  throw 'not a boolean'
}, { default: false, coerce: true })

const list = pipe((value, { type, fix, fieldPath }) => {
  if (Array.isArray(value)) {
    return value.reduce((prevVal, item, i) => [
      ...prevVal,
      fix(item, type, { fieldPath: `${fieldPath}[${i}]` })
    ], [])
  }

  throw 'not an array'
}, { default: [] })

const trim = pipe(value => {
  if (typeof value != 'string') {
    throw 'not a string'
  }

  return value.trim()
})

const lower = pipe(value => {
  if (typeof value != 'string') {
    throw 'not a string'
  }

  return value.toLocaleLowerCase()
})

module.exports = { text, float, bool, list, trim, lower }
