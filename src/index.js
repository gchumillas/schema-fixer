const { concat } = require('./core/utils')
const { pipe } = require('./core/pipe')

const parse = (value, schema, { fieldPath = '' } = {}) => {
  if (Array.isArray(schema)) {
    return schema.reduce((prevVal, pipe) => pipe(prevVal), value)
  }

  return Object.entries(schema).reduce((prevVal, [field, fieldSchema]) => ({
    ...prevVal,
    [field]: parse(value[field], fieldSchema, { fieldPath: concat([fieldPath, field], '.'), parse })
  }), {})
}

module.exports = { parse, pipe }
