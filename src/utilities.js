const { fix } = require('./main')
const { isNone, isObject } = require('./_utils')

// this is a convenient utility to allow nested schemas
const schema = (schema) => (value) => {
  const defValue = isObject(schema) ? {} : undefined

  if (isNone(value)) {
    value = defValue
  }

  return fix(value, schema)
}

// this is a convenient utility to join parsers
const join =
  (...fixers) =>
  (value) => {
    return fix(value, fixers)
  }

module.exports = {
  schema,
  join
}
