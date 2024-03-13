const { parse, createParser } = require('./main')

const string = createParser(
  (value, params) => {
    const { coerced = true } = params

    if (typeof value == 'string') {
      return value
    } else if (coerced && ['boolean', 'number'].includes(typeof value)) {
      return `${value}`
    }

    throw new Error('not a string')
  },
  { default: '' }
)

const number = createParser(
  (value, params) => {
    const { coerced = true } = params

    if (typeof value == 'number') {
      return value
    } else if (coerced && ['boolean', 'string'].includes(typeof value)) {
      const val = +value
      if (isNaN(val)) {
        throw new Error('not a number')
      }

      return +value
    }

    throw new Error('not a number')
  },
  { default: 0 }
)

const boolean = createParser(
  (value, params) => {
    const { coerced = true } = params

    if (typeof value == 'boolean') {
      return value
    } else if (coerced) {
      return !!value
    }

    throw new Error('not a boolean')
  },
  { default: false }
)

const array = createParser(
  (value, params) => {
    const { of: type, path } = params

    if (Array.isArray(value)) {
      const [val, errors] = value.reduce(
        ([prevVal, prevErrors], item, i) => {
          const [val, errors] = parse(item, type, { path: `${path}[${i}]` })
          return [
            [...prevVal, val],
            [...prevErrors, ...errors]
          ]
        },
        [[], []]
      )

      if (errors.length) {
        throw new Error('not an array', { cause: errors })
      }

      return val
    }

    throw new Error('not an array')
  },
  { default: [] }
)

const trim = createParser(
  (value) => {
    if (typeof value != 'string') {
      throw new Error('not a string')
    }

    return value.trim()
  },
  { default: '' }
)

const lower = createParser(
  (value) => {
    if (typeof value != 'string') {
      throw new Error('not a string')
    }

    return value.toLocaleLowerCase()
  },
  { default: '' }
)

const upper = createParser(
  (value) => {
    if (typeof value != 'string') {
      throw new Error('not a string')
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
