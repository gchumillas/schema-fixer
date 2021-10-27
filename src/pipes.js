// TODO: add enum type
const { error, ok } = require('./core/utils')
const { pipe } = require('./core/pipe')

const string = pipe((value, { coerce, require }) => {
  if (typeof value == 'string') {
    if (require && !value) {
      return error('required')
    }

    return ok(value)
  } else if (coerce && ['boolean', 'number'].includes(typeof value)) {
    return ok(`${value}`)
  }

  return error('not a string')
}, { default: '', coerce: true })

const number = pipe((value, { coerce }) => {
  if (typeof value == 'number') {
    return ok(value)
  } else if (coerce && !isNaN(value)) {
    return ok(+value)
  }

  return error('not a number')
}, { default: 0, coerce: true })

const boolean = pipe((value, { coerce }) => {
  if (typeof value == 'boolean') {
    return ok(value)
  } else if (coerce) {
    return ok(!!value)
  }

  return error('not a boolean')
}, { default: false, coerce: true })

const array = pipe((value, { type, parse, path }) => {
  if (Array.isArray(value)) {
    const [val, errors] = value.reduce(([prevVal, prevErrors], item, i) => {
      const [val, errors] = parse(item, type, { path: `${path}[${i}]` })
      return [[...prevVal, val], [...prevErrors, ...errors]]
    }, [[], []])

    if (errors.length) {
      return error(errors)
    }

    return ok(val)
  }

  return error('not an array')
}, { default: [] })

const trim = pipe(value => {
  if (typeof value != 'string') {
    return error('not a string')
  }

  return ok(value.trim())
})

const lower = pipe(value => {
  if (typeof value != 'string') {
    return error('not a string')
  }

  return ok(value.toLocaleLowerCase())
})

const upper = pipe(value => {
  if (typeof value != 'string') {
    return error('not a string')
  }

  return ok(value.toLocaleUpperCase())
})

module.exports = {
  string, trim, lower, upper,
  number,
  boolean,
  array
}
