const { isNull, error, ok } = require('./utils')

const pipe = (fn, defaultOptions = {}) => {
  defaultOptions = { require: false, ...defaultOptions }

  return (options = {}) => {
    options = { ...defaultOptions, ...options }

    return (value, extraOptions = {}) => {
      extraOptions = { ...options, ...extraOptions }

      if (isNull(value)) {
        const { default: defValue, require } = extraOptions

        if (require) {
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
