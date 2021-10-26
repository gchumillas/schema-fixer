const concat = (texts, glue = '') => {
  return texts.filter(x => !!x).join(glue)
}

const isNull = value => {
  return value === null || value === undefined
}

module.exports = { concat, isNull }
