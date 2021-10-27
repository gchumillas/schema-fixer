const concat = (texts, glue = '') => texts.filter(x => !!x).join(glue)
const error = text => new Error(text)
const isNull = value => value === null || value === undefined
const isObject = value => value !== null && typeof value == 'object' && !Array.isArray(value)

module.exports = { concat, isNull, isObject, error }
