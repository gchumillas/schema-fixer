const { fix, createFixer } = require('./main')

// TODO: replace string with text
const string = createFixer(
  (value, params) => {
    const { coerce = true } = params

    if (typeof value == 'string') {
      return value
    } else if (coerce && ['boolean', 'number'].includes(typeof value)) {
      return `${value}`
    }

    throw new TypeError('not a string')
  },
  { default: '' }
)

// TODO: replace number with float
const number = createFixer(
  (value, params) => {
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
  },
  { default: 0 }
)

// TODO: replace boolean with bool
const boolean = createFixer(
  (value, params) => {
    const { coerce = true } = params

    if (typeof value == 'boolean') {
      return value
    } else if (coerce) {
      return !!value
    }

    throw new TypeError('not a boolean')
  },
  { default: false }
)

// TODO: replace array with list
const array = createFixer(
  (value, params) => {
    const { of: type, path } = params

    if (Array.isArray(value)) {
      const val = value.reduce(
        (prevVal, item, i) => {
          const val = fix(item, type, { path: `${path}[${i}]` })
          return [...prevVal, val]
        },
        []
      )

      return val
    }

    throw new TypeError('not an array')
  },
  { default: [] }
)

const trim = createFixer(
  (value) => {
    if (typeof value != 'string') {
      throw new TypeError('not a string')
    }

    return value.trim()
  },
  { default: '' }
)

const lower = createFixer(
  (value) => {
    if (typeof value != 'string') {
      throw new TypeError('not a string')
    }

    return value.toLocaleLowerCase()
  },
  { default: '' }
)

const upper = createFixer(
  (value) => {
    if (typeof value != 'string') {
      throw new TypeError('not a string')
    }

    return value.toLocaleUpperCase()
  },
  { default: '' }
)

module.exports = {
  string,
  trim,
  lower,
  upper,
  number,
  boolean,
  array
}
