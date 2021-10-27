const concat = (texts, glue = '') => {
  return texts.filter(x => !!x).join(glue)
}

const isNull = value => {
  return value === null || value === undefined
}

const isObject = value => {
  return value !== null && typeof value == 'object' && !Array.isArray(value)
}

const error = text => new Error(text)

module.exports = { concat, isNull, isObject, error }
