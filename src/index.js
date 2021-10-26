const { concat } = require('./core/utils')
const { pipe } = require('./core/pipe')
const { string, number, boolean, trim, lower, upper, array } = require('./pipes')

const shorthands = {
  'string': string(),
  'number': number(),
  'boolean': boolean(),
  'trim': trim(),
  'lower': lower(),
  'upper': upper(),
  'string[]': array({ type: [string()] }),
  'number[]': array({ type: [number()] }),
  'boolean[]': array({ type: [boolean()] })
}

const parse = (value, schema, { fieldPath = '' } = {}) => {
  if (['function', 'string'].includes(typeof schema)) {
    schema = [schema]
  }

  if (Array.isArray(schema)) {
    try {
      const val = schema.reduce((prevVal, pipe) => {
        let fn = pipe
        if (typeof pipe == 'string') {
          fn = shorthands[pipe]
          if (!fn) {
            throw `unrecognized ${pipe} pipe`
          }
        }

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
