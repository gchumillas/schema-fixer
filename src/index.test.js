const { fix } = require('./index')
const { text, float } = require('./pipes')

describe('Text validation', () => {
  test('basic', () => {
    expect(fix('hello there!', [text()])).toBe('hello there!')
    expect(fix(true, [text()])).toBe('true')
    expect(fix(125.48, [text()])).toBe('125.48')
  })

  test('require option', () => {
    expect(() => fix(null, [text({ require: true })])).toThrow('required')
    expect(() => fix(undefined, [text({ require: true })])).toThrow('required')
    expect(() => fix('', [text({ require: true })])).toThrow('required')
  })

  test('default option', () => {
    expect(fix(undefined, [text({ default: 'John Smith' })])).toBe('John Smith')
  })

  test('coerce option', () => {
    expect(() => fix(true, [text({ coerce: false })])).toThrow('not a string')
    expect(() => fix(125.48, [text({ coerce: false })])).toThrow('not a string')
  })
})

describe('Float validation', () => {
  test('basic', () => {
    expect(fix(125.48, [float()])).toBe(125.48)
    expect(fix('125.48', [float()])).toBe(125.48)
    expect(() => fix('lorem ipsum', [float()])).toThrow('not a number')
  })

  test('require option', () => {
    expect(() => fix(null, [float({ require: true })])).toThrow('required')
  })
})
