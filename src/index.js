const { parse, fix, createFixer } = require('./main')
const parsers = require('./parsers')

module.exports = { parse, fix, createFixer, ...parsers }
