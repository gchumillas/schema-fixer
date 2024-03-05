const { parse } = require('./main')
const { isNull, isObject } = require('./_utils')

// this is a convenient utility to allow nested schemas
const schema = (schema) => (value) => {
  const defValue = isObject(schema) ? {} : undefined

  if (isNull(value)) {
    value = defValue
  }

  const [val, errors] = parse(value, schema)

  if (errors.length) {
    throw new Error('not a valid schema', { cause: errors })
  }

  return val
}

module.exports = {
  schema
}
