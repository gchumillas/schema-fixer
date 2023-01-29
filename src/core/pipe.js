const { isNull, error, ok } = require('./utils')

const pipe = (fn, { default: defValue } = {}) => {
  return (options = {}) => {
    options = { required: false, default: defValue, ...options }

    return (value, extraOptions = {}) => {
      extraOptions = { ...options, ...extraOptions }

      if (isNull(value)) {
        const { default: defValue, required } = extraOptions

        if (required) {
          return error('required')
        }

        if (!isNull(defValue)) {
          return [fn(defValue, { ...options, ...extraOptions })].flat()
        }

        return ok(undefined)
      }

      return [fn(value, { ...options, ...extraOptions })].flat()
    }
  }
}

module.exports = { pipe }
