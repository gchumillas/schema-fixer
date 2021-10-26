const { isNull } = require('./utils')

const pipe = (fn, defaultOptions = {}) => {
  defaultOptions = { require: false, ...defaultOptions }

  return (options = {}) => {
    options = { ...defaultOptions, ...options }

    return (value, extraOptions = {}) => {
      extraOptions = { ...options, ...extraOptions }

      const { default: defValue } = extraOptions
      if (isNull(value) && !isNull(defValue)) {
        return fn(defValue, { ...options, ...extraOptions })
      }

      return fn(value, { ...options, ...extraOptions })
    }
  }
}

module.exports = { pipe }
