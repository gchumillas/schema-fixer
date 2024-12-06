const { isObject, concat, isNone } = require('./_utils')

const fix = (value, schema, { path = '' } = {}) => {
  if (typeof schema == 'function') {
    schema = [schema]
  }

  // parses an array
  if (Array.isArray(schema)) {
    return schema.reduce((acc, parser) => parser(acc, { path }), value)
  }

  if (!isObject(value)) {
    value = {}
  }

  // parses an object
  return Object.entries(schema).reduce((props, [prop, parser]) => ({
    ...props,
    [prop]: fix(value[prop], parser, { path: concat([path, prop], '.') })
  }), {})
}

function createFixer(fn, options) {
  return (options1) => {
    // TODO: (all) replace default with def, since "default" is a reserver word
    const { default: defValue, required = true } = { ...options, ...options1 }

    return (value, options2) => {
      const params = { ...options, ...options1, ...options2 }
      const { path } = params

      // TODO: remove value === '' (optional)
      if (isNone(value) || value === '') {
        if (required) {
          return defValue
        }

        return undefined
      }

      try {
        return fn(value, params)
      } catch(e) {
        console.error([path, e.message ?? `${e}`].filter(x => !!x).join(': '))
        return required ? defValue : undefined
      }
    }
  }
}

module.exports = { fix, createFixer }
