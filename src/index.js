const { concat } = require('./core/utils')
const { pipe } = require('./core/pipe')
const { text, float, bool, trim, lower, upper, list } = require('./pipes')

const shorthands = {
  'text': text(),
  'float': float(),
  'bool': bool(),
  'trim': trim(),
  'lower': lower(),
  'upper': upper(),
  'text[]': list({ type: [text()] }),
  'float[]': list({ type: [float()] }),
  'bool[]': list({ type: [bool()] })
}

const fix = (value, schema, { fieldPath = '' } = {}) => {
  if (['function', 'string'].includes(typeof schema)) {
    schema = [schema]
  }

  if (Array.isArray(schema)) {
    return schema.reduce((prevVal, pipe) => {
      // TODO: check for the shorthand to exist
      const fn = typeof pipe == 'string' ? shorthands[pipe] : pipe
      return fn(prevVal, { fieldPath, fix })
    }, value)
  }

  return Object.entries(schema).reduce((prevVal, [field, fieldSchema]) => ({
    ...prevVal,
    [field]: fix(value[field], fieldSchema, { fieldPath: concat([fieldPath, field], '.'), fix })
  }), {})
}

module.exports = { fix, pipe }
