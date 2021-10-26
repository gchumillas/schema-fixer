const { concat } = require('./core/utils')
const { pipe } = require('./core/pipe')

const fix = (value, schema, { fieldPath = '' } = {}) => {
  if (Array.isArray(schema)) {
    return schema.reduce((prevVal, pipe) => pipe(prevVal), value)
  }

  return Object.entries(schema).reduce((prevVal, [field, fieldSchema]) => ({
    ...prevVal,
    [field]: fix(value[field], fieldSchema, { fieldPath: concat([fieldPath, field], '.'), fix })
  }), {})
}

module.exports = { fix, pipe }
