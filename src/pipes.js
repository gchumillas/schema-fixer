const { parse } = require('./main')
const { isNull } = require('./_utils')

const string =
  (params = {}) =>
  (value) => {
    const { default: defValue = '', required = false, coerced = true } = params

    if (isNull(value) || value === '') {
      if (required) {
        throw new Error('required')
      }

      value = defValue
    }

    if (typeof value == 'string') {
      if (required && !value) {
        throw new Error('required')
      }

      return value
    } else if (coerced && ['boolean', 'number'].includes(typeof value)) {
      return `${value}`
    }

    throw new Error('not a string')
  }

const number =
  (params = {}) =>
  (value) => {
    const { default: defValue = 0, required = false, coerced = true } = params

    if (isNull(value)) {
      if (required) {
        throw new Error('required')
      }

      value = defValue
    }

    if (typeof value == 'number') {
      return value
    } else if (coerced && !isNaN(value)) {
      return +value
    }

    throw new Error('not a number')
  }

const boolean =
  (params = {}) =>
  (value) => {
    const { default: defValue = false, required = false, coerced = true } = params

    if (isNull(value)) {
      if (required) {
        throw new Error('required')
      }

      value = defValue
    }

    if (typeof value == 'boolean') {
      return value
    } else if (coerced) {
      return !!value
    }

    throw new Error('not a boolean')
  }

const array =
  (params = {}) =>
  (value, { path }) => {
    const { default: defValue = [], required = false, of: type } = params

    if (isNull(value)) {
      if (required) {
        throw new Error('required')
      }

      value = defValue
    }

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
  }

const trim = () => (value) => {
  if (typeof value != 'string') {
    throw new Error('not a string')
  }

  return value.trim()
}

const lower = () => (value) => {
  if (typeof value != 'string') {
    throw new Error('not a string')
  }

  return value.toLocaleLowerCase()
}

const upper = () => (value) => {
  if (typeof value != 'string') {
    throw new Error('not a string')
  }

  return value.toLocaleUpperCase()
}

module.exports = {
  string,
  trim,
  lower,
  upper,
  number,
  boolean,
  array
}
