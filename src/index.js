// UTILITIES
const concat = (texts, glue = '') => texts.filter((x) => !!x).join(glue)
const isNone = (value) => value === null || value === undefined
const isObject = (value) => value !== null && typeof value == 'object' && !Array.isArray(value)

const createFixer = (def, fn) => {
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

// BUILD-IN FIXERS
const text = createFixer('', (value, params) => {
  const { coerce = true } = params

  if (typeof value == 'string') {
    return value
  } else if (coerce && ['boolean', 'number'].includes(typeof value)) {
    return `${value}`
  }

  throw new TypeError('not a string')
})

const float = createFixer(0, (value, params) => {
  const { coerce = true } = params

  if (typeof value == 'number') {
    return value
  } else if (coerce && ['boolean', 'string'].includes(typeof value)) {
    const val = +value
    if (isNaN(val)) {
      throw new TypeError('not a number')
    }

    return +value
  }

  throw new TypeError('not a number')
})

const bool = createFixer(false, (value, params) => {
  const { coerce = true } = params

  if (typeof value == 'boolean') {
    return value
  } else if (coerce) {
    return !!value
  }

  throw new TypeError('not a boolean')
})

const list = createFixer([], (value, params) => {
  const { of: type, path } = params

  if (Array.isArray(value)) {
    const val = value.reduce((prevVal, item, i) => {
      const val = fix(item, type, { path: `${path}[${i}]` })
      return [...prevVal, val]
    }, [])

    return val
  }

  throw new TypeError('not an array')
})

const trim = createFixer('', (value) => {
  if (typeof value != 'string') {
    throw new TypeError('not a string')
  }

  return value.trim()
})

const lower = createFixer('', (value) => {
  if (typeof value != 'string') {
    throw new TypeError('not a string')
  }

  return value.toLocaleLowerCase()
})

const upper = createFixer('', (value) => {
  if (typeof value != 'string') {
    throw new TypeError('not a string')
  }

  return value.toLocaleUpperCase()
})

// MAIN FUNCTIONS
const fixerByAlias = {
  'string': text(),
  'number': float(),
  'boolean': bool(),
  'string[]': list({ of: text() }),
  'number[]': list({ of: float() }),
  'boolean[]': list({ of: bool() })
}

const fix = (value, schema, { path = '' } = {}) => {
  if (['string', 'function'].includes(typeof schema)) {
    schema = [schema]
  }

  // parses an array
  if (Array.isArray(schema)) {
    return schema.reduce((acc, fixer) => {
      const f = typeof fixer == 'string' ? fixerByAlias[fixer] : fixer
      return f(acc, { path })
    }, value)
  }

  if (!isObject(value)) {
    value = {}
  }

  // parses an object
  return Object.entries(schema).reduce(
    (props, [prop, fixer]) => ({
      ...props,
      [prop]: fix(value[prop], typeof fixer == 'string' ? fixerByAlias[fixer] : fixer, {
        path: concat([path, prop], '.')
      })
    }),
    {}
  )
}

module.exports = {
  // main functinos
  fix,
  // utilities
  createFixer,
  // built-in fixers
  text,
  float,
  bool,
  list,
  trim,
  lower,
  upper
}
