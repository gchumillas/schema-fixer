const { tryCatch, isObject, concat, isNone } = require('./_utils')

const parse = (value, schema, { path = '' } = {}) => {
  if (typeof schema == 'function') {
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

function createParser(fn, options = {}) {
  return (options1) => (value, options2) => {
    const params = { ...options, ...options1, ...options2 }
    const { default: defValue, required = true } = params

    if (isNone(value) || value === '') {
      value = defValue

      if (isNone(value)) {
        if (required) {
          throw new Error('required')
        }

        return value
      }
    }

    return fn(value, { ...params, required })
  }
}

module.exports = { parse, fix, createParser }
