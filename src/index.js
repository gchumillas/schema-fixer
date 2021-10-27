const { concat, isObject, error, ok } = require('./core/utils')
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

const parse = (value, schema, { path = '' } = {}) => {
  if (['function', 'string'].includes(typeof schema)) {
    schema = [schema]
  }

  if (Array.isArray(schema)) {
    let acc = value
    for (const pipe of schema) {
      let fn = pipe
      if (typeof pipe == 'string') {
        fn = shorthands[pipe]
        if (!fn) {
          const error = `unrecognized ${pipe} pipe`
          return [value, [{ path, error }]]
        }
      }

      const [val, error] = fn(acc, { path, parse })
      if (error) {
        return [value, [{ path, error }]]
      }

      acc = val
    }

    return [acc, []]
  }

  if (!isObject(value)) {
    const error = 'not an object'
    return [value, [{ path, error }]]
  }

  return Object.entries(schema).reduce(([prevVal, prevErrors], [field, fieldSchema]) => {
    const [val, errors] = parse(value[field], fieldSchema, { path: concat([path, field], '.'), parse })
    return [{ ...prevVal, [field]: val }, [...prevErrors, ...errors]]
  }, [{}, []])
}

const fix = (value, schema) => {
  const [val, errors] = parse(value, schema)
  if (errors.length) {
    const [{ path, error }] = errors
    throw new Error(!path ? error : JSON.stringify(errors))
  }
  return val
}

module.exports = { parse, fix, pipe, error, ok }
