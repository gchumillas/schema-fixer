const { parse, fix, createFixer } = require('./main')
const fixers = require('./fixers')

module.exports = { parse, fix, createFixer, ...fixers }
