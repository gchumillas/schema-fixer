const { isObject, concat, isNone } = require('./_utils')

const fix = (value, schema, { path = '' } = {}) => {
  if (typeof schema == 'function') {
    schema = [schema]
  }

  // parses an array
  if (Array.isArray(schema)) {
    return schema.reduce((acc, fixer) => fixer(acc, { path }), value)
  }

  if (!isObject(value)) {
    value = {}
  }

  // parses an object
  return Object.entries(schema).reduce(
    (props, [prop, fixer]) => ({
      ...props,
      [prop]: fix(value[prop], fixer, { path: concat([path, prop], '.') })
    }),
    {}
  )
}

function createFixer(def, fn) {
  return (options1) => {
    const { def: defValue, required = true } = { def, ...options1 }

    return (value, options2) => {
      const params = { ...options1, ...options2 }
      const { path } = params

      if (isNone(value)) {
        if (required) {
          return defValue
        }

        return undefined
      }

      try {
        return fn(value, params)
      } catch (e) {
        console.error([path, e.message ?? `${e}`].filter((x) => !!x).join(': '))
        return required ? defValue : undefined
      }
    }
  }
}

module.exports = { fix, createFixer }
