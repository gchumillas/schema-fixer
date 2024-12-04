const { tryCatch, isObject, concat, isNone } = require('./_utils')

const parse = (value, schema, { path = '' } = {}) => {
  if (typeof schema == 'function') {
    schema = [schema]
  }

  if (Array.isArray(schema)) {
    let acc = value
    for (const parser of schema) {
      const [val, error] = tryCatch(() => parser(acc, { path }))
      if (error) {
        return [parser.defValue, [{ path, error }]]
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
  return (options1) => {
    const { default: defValue, required = true } = { ...options, ...options1 }

    const parser = (value, options2) => {
      if (isNone(value) || value === '') {
        value = defValue

        if (isNone(value)) {
          if (required) {
            throw new Error('required')
          }

          return value
        }
      }

      return fn(value, { ...options, ...options1, ...options2 })
    }

    parser.defValue = defValue
    return parser
  }
}

module.exports = { parse, fix, createParser }
