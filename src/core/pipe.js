const { isNull } = require('./utils')

const pipe = (fn, defaultOptions = {}) => {
  defaultOptions = { require: false, ...defaultOptions }

  return (options = {}) => {
    options = { ...defaultOptions, ...options }

    return (value, extraOptions = {}) => {
      extraOptions = { ...options, ...extraOptions }

      if (isNull(value)) {
        const { default: defValue, require } = extraOptions
        if (!isNull(defValue)) {
          return fn(defValue, { ...options, ...extraOptions })
        }

        if (require) {
          throw 'required'
        }

        return undefined
      }

      return fn(value, { ...options, ...extraOptions })
    }
  }
}

module.exports = { pipe }
