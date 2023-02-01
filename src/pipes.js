const { error, ok, concat } = require('./core/utils')
const { pipe } = require('./core/pipe')

const string = pipe((value, { coerced = true, required }) => {
  if (typeof value == 'string') {
    if (required && !value) {
      return error('required')
    }

    return ok(value)
  } else if (coerced && ['boolean', 'number'].includes(typeof value)) {
    return ok(`${value}`)
  }

  return error('not a string')
}, { default: '' })

const number = pipe((value, { coerced = true }) => {
  if (typeof value == 'number') {
    return ok(value)
  } else if (coerced && !isNaN(value)) {
    return ok(+value)
  }

  return error('not a number')
}, { default: 0 })

const boolean = pipe((value, { coerced = true }) => {
  if (typeof value == 'boolean') {
    return ok(value)
  } else if (coerced) {
    return ok(!!value)
  }

  return error('not a boolean')
}, { default: false })

const date = pipe((value) => {
  const milliseconds = Date.parse(`${value}`)
  if (isNaN(milliseconds)) {
    return error('not a date')
  }

  const date = new Date(milliseconds)
  return ok(date.toISOString())
})

const array = pipe((value, { of: type, parse, path }) => {
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

const included = pipe((value, { in: values }) => {
  if (typeof value != 'string') {
    return error('not a string')
  }

  if (values.includes(value)) {
    return ok(value)
  }

  return error(`${value} is not in [${concat(values, ', ')}]`)
})

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
  date,
  array,
  included
}
