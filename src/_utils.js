const concat = (texts, glue = '') => texts.filter((x) => !!x).join(glue)
const isNone = (value) => value === null || value === undefined
const isObject = (value) => value !== null && typeof value == 'object' && !Array.isArray(value)

const tryCatch = (fn) => {
  let val, err
  try {
    val = fn()
  } catch (error) {
    err = error.cause ?? (error.message || `${error}`)
  }
  return [val, err]
}

module.exports = { concat, isNone, isObject, tryCatch }
