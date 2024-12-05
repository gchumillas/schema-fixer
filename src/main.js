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
    // TODO: (all) show path or type information
    // console.log('not an object')
    value = {}
  }

  // parses an object
  return Object.entries(schema).reduce((props, [prop, parser]) => ({
    ...props,
    [prop]: fix(value[prop], parser, { path: concat([path, prop], '.') })
  }), {})
}

// TODO: rename to createFixer
function createParser(fn, options = {}) {
  return (options1) => {
    const { default: defValue, required = true } = { ...options, ...options1 }

    return (value, options2) => {
      // TODO: remove value === '' (optional)
      if (isNone(value) || value === '') {
        if (required) {
          // console.log('required')
          return defValue
        }

        return undefined
      }

      return fn(value, { ...options, ...options1, ...options2 })
    }
  }
}

module.exports = { fix, createParser }
