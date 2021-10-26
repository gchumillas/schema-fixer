// TODO: replace text, bool, list by string, boolean, array respectivel (they are not reserver keywords)
const { pipe } = require('./core/pipe')

const string = pipe((value, { coerce, require }) => {
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

const list = pipe((value, { type, parse, fieldPath }) => {
  if (Array.isArray(value)) {
    const [val, errors] = value.reduce(([prevVal, prevErrors], item, i) => {
      const [val, errors] = parse(item, type, { fieldPath: `${fieldPath}[${i}]` })
      return [[...prevVal, val], [...prevErrors, ...errors]]
    }, [[], []])

    if (errors.length) {
      throw errors
    }

    return val
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

const upper = pipe(value => {
  if (typeof value != 'string') {
    throw 'not a string'
  }

  return value.toLocaleUpperCase()
})

module.exports = {
  string, trim, lower, upper, // string pipelines
  float,
  bool,
  list
}
