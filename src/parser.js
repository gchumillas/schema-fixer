const { tryCatch, isObject, concat } = require('./utils')

const parse = (value, schema, { path = '' } = {}) => {
  if (['function', 'string'].includes(typeof schema)) {
    schema = [schema]
  }

  if (Array.isArray(schema)) {
    let acc = value
    for (const pipe of schema) {
      const [val, error] = tryCatch(() => pipe(acc, { path }))
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

  return Object.entries(schema).reduce(
    ([prevVal, prevErrors], [field, fieldSchema]) => {
      const [val, errors] = parse(value[field], fieldSchema, { path: concat([path, field], '.') })
      return [{ ...prevVal, [field]: val }, [...prevErrors, ...errors]]
    },
    [{}, []]
  )
}

const fix = (value, schema) => {
  const [val, errors] = parse(value, schema)
  if (errors.length) {
    const [{ path, error }] = errors
    throw new Error(!path ? error : JSON.stringify(errors))
  }
  return val
}

module.exports = { parse, fix }
