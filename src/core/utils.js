const concat = (texts, glue = '') => {
  return texts.filter(x => !!x).join(glue)
}

const isNull = value => {
  return value === null || value === undefined
}

const isObject = value => {
  return value !== null && typeof value == 'object' && !Array.isArray(value)
}

const test = command => {
  try {
    return [command()]
  } catch (e) {
    return [undefined, e]
  }
}

module.exports = { concat, isNull, isObject, test }
