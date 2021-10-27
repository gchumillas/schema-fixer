const concat = (texts, glue = '') => texts.filter(x => !!x).join(glue)
const isNull = value => value === null || value === undefined
const isObject = value => value !== null && typeof value == 'object' && !Array.isArray(value)
const error = err => [undefined, err]
const ok = value => [value]

module.exports = { concat, isNull, isObject, error, ok }
