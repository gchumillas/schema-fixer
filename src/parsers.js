const { fix, createFixer } = require('./main')

const text = createFixer('', (value, params) => {
  const { coerce = true } = params

  if (typeof value == 'string') {
    return value
  } else if (coerce && ['boolean', 'number'].includes(typeof value)) {
    return `${value}`
  }

  throw new TypeError('not a string')
})

// TODO: replace number with float
const number = createFixer(0, (value, params) => {
  const { coerce = true } = params

  if (typeof value == 'number') {
    return value
  } else if (coerce && ['boolean', 'string'].includes(typeof value)) {
    const val = +value
    if (isNaN(val)) {
      throw new TypeError('not a number')
    }

    return +value
  }

  throw new TypeError('not a number')
})

// TODO: replace boolean with bool
const boolean = createFixer(false, (value, params) => {
  const { coerce = true } = params

  if (typeof value == 'boolean') {
    return value
  } else if (coerce) {
    return !!value
  }

  throw new TypeError('not a boolean')
})

// TODO: replace array with list
const array = createFixer([], (value, params) => {
  const { of: type, path } = params

  if (Array.isArray(value)) {
    const val = value.reduce((prevVal, item, i) => {
      const val = fix(item, type, { path: `${path}[${i}]` })
      return [...prevVal, val]
    }, [])

    return val
  }

  throw new TypeError('not an array')
})

const trim = createFixer('', (value) => {
  if (typeof value != 'string') {
    throw new TypeError('not a string')
  }

  return value.trim()
})

const lower = createFixer('', (value) => {
  if (typeof value != 'string') {
    throw new TypeError('not a string')
  }

  return value.toLocaleLowerCase()
})

const upper = createFixer('', (value) => {
  if (typeof value != 'string') {
    throw new TypeError('not a string')
  }

  return value.toLocaleUpperCase()
})

module.exports = {
  text,
  trim,
  lower,
  upper,
  number,
  boolean,
  array
}
