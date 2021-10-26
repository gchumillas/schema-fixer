const { concat } = require('./core/utils')
const { pipe } = require('./core/pipe')
const { string, float, bool, trim, lower, upper, list } = require('./pipes')

const shorthands = {
  'string': string(),
  'float': float(),
  'bool': bool(),
  'trim': trim(),
  'lower': lower(),
  'upper': upper(),
  'string[]': list({ type: [string()] }),
  'float[]': list({ type: [float()] }),
  'bool[]': list({ type: [bool()] })
}

const parse = (value, schema, { fieldPath = '' } = {}) => {
  if (['function', 'string'].includes(typeof schema)) {
    schema = [schema]
  }

  if (Array.isArray(schema)) {
    try {
      const val = schema.reduce((prevVal, pipe) => {
        // TODO: check for the shorthand to exist
        const fn = typeof pipe == 'string' ? shorthands[pipe] : pipe
        return fn(prevVal, { fieldPath, parse })
      }, value)
      return [val, []]
    } catch (error) {
      return [value, [fieldPath ? { path: fieldPath, error } : error]]
    }
  }

  return Object.entries(schema).reduce(([prevVal, prevErrors], [field, fieldSchema]) => {
    const [val, errors] = parse(value[field], fieldSchema, { fieldPath: concat([fieldPath, field], '.'), parse })
    return [{ ...prevVal, [field]: val }, [...prevErrors, ...errors]]
  }, [{}, []])
}

const fix = (value, schema) => {
  const [val, errors] = parse(value, schema)
  if (errors.length) {
    throw errors
  }
  return val
}

module.exports = { parse, fix, pipe }
