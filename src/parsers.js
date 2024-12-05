const { fix, createFixer } = require('./main')

const string = createFixer(
  (value, params) => {
    const { coerce = true, default: defValue } = params

    if (typeof value == 'string') {
      return value
    } else if (coerce && ['boolean', 'number'].includes(typeof value)) {
      return `${value}`
    }

    // console.log('not a string')
    return defValue
  },
  { default: '' }
)

const number = createFixer(
  (value, params) => {
    const { coerce = true, default: defValue } = params

    if (typeof value == 'number') {
      return value
    } else if (coerce && ['boolean', 'string'].includes(typeof value)) {
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

const boolean = createFixer(
  (value, params) => {
    const { coerce = true, default: defValue } = params

    if (typeof value == 'boolean') {
      return value
    } else if (coerce) {
      return !!value
    }

    // console.log('not a boolean')
    return defValue
  },
  { default: false }
)

const array = createFixer(
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

const trim = createFixer(
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

const lower = createFixer(
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

const upper = createFixer(
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
