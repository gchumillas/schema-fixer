const { concat } = require('./core/utils')
const { pipe } = require('./core/pipe')
const pipes = require('./pipes')

const fix = (value, schema, { fieldPath = '' } = {}) => {
  if (Array.isArray(schema)) {
    return schema.reduce((prevVal, pipe) => {
      const fn = typeof pipe == 'string' ? pipes[pipe]() : pipe
      return fn(prevVal, { fieldPath, fix })
    }, value)
  }

  return Object.entries(schema).reduce((prevVal, [field, fieldSchema]) => ({
    ...prevVal,
    [field]: fix(value[field], fieldSchema, { fieldPath: concat([fieldPath, field], '.'), fix })
  }), {})
}

module.exports = { fix, pipe }
