const { fix, createParser } = require('./main')

// TODO: (all) coerced is confusing, remove it. It should be alwasy 'true'
const string = createParser(
  (value, params) => {
    const { coerced = true, default: defValue } = params

    if (typeof value == 'string') {
      return value
    } else if (coerced && ['boolean', 'number'].includes(typeof value)) {
      return `${value}`
    }

    // console.log('not a string')
    return defValue
  },
  { default: '' }
)

const number = createParser(
  (value, params) => {
    const { coerced = true, default: defValue } = params

    if (typeof value == 'number') {
      return value
    } else if (coerced && ['boolean', 'string'].includes(typeof value)) {
      const val = +value
      if (isNaN(val)) {
        // console.log('not a number')
        return defValue
      }

      return +value
    }

    // console.log('not a number')
    return defValue
  },
  { default: 0 }
)

const boolean = createParser(
  (value, params) => {
    const { coerced = true, default: defValue } = params

    if (typeof value == 'boolean') {
      return value
    } else if (coerced) {
      return !!value
    }

    // console.log('not a boolean')
    return defValue
  },
  { default: false }
)

const array = createParser(
  (value, params) => {
    const { of: type, default: defValue, path } = params

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

    // console.log('not an array')
    return defValue
  },
  { default: [] }
)

const trim = createParser(
  (value, params) => {
    const { default: defValue } = params

    if (typeof value != 'string') {
      // console.log('not a string')
      return defValue
    }

    return value.trim()
  },
  { default: '' }
)

const lower = createParser(
  (value, params) => {
    const { default: defValue } = params

    if (typeof value != 'string') {
      // console.log('not a string')
      return defValue
    }

    return value.toLocaleLowerCase()
  },
  { default: '' }
)

const upper = createParser(
  (value, params) => {
    const { default: defValue } = params

    if (typeof value != 'string') {
      // console.log('not a string')
      return defValue
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
