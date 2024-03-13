const { parse } = require('./main')
const { isNone, isObject } = require('./_utils')

// this is a convenient utility to allow nested schemas
const schema = (schema) => (value) => {
  const defValue = isObject(schema) ? {} : undefined

  if (isNone(value)) {
    value = defValue
  }

  const [val, errors] = parse(value, schema)

  if (errors.length == 1) {
    const { path, error } = errors[0]
    throw new Error('', { cause: path ? errors : error })
  } else if (errors.length > 0) {
    throw new Error('not a valid schema', { cause: errors })
  }

  return val
}

// this is a convenient utility to join parsers
const join =
  (...fixers) =>
  (value) => {
    const [val, errors] = parse(value, fixers)

    if (errors.length == 1) {
      const { path, error } = errors[0]
      throw new Error('', { cause: path ? errors : error })
    } else if (errors.length > 0) {
      throw new Error('not a valid schema', { cause: errors })
    }

    return val
  }

module.exports = {
  schema,
  join
}
