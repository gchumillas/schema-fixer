const { fix } = require('./index')
const { text, float, bool, list, trim, lower, upper } = require('./pipes')

describe('Text validation', () => {
  test('basic', () => {
    expect(fix('hello there!', [text()])).toBe('hello there!')
    expect(fix(true, [text()])).toBe('true')
    expect(fix(125.48, [text()])).toBe('125.48')
  })

  test('require option', () => {
    expect(() => fix(undefined, [text({ require: true })])).toThrow('required')
    expect(() => fix('', [text({ require: true })])).toThrow('required')
  })

  test('default option', () => {
    expect(fix(undefined, [text()])).toBe('')
    expect(fix(undefined, [text({ default: undefined })])).toBeUndefined()
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
    expect(() => fix(undefined, [float({ require: true })])).toThrow('required')
  })

  test('default option', () => {
    expect(fix(undefined, [float()])).toBe(0)
    expect(fix(undefined, [float({ default: undefined })])).toBeUndefined()
    expect(fix(undefined, [float({ default: 125.48 })])).toBe(125.48)
  })

  test('coerce option', () => {
    expect(() => fix('125.48', [float({ coerce: false })])).toThrow('not a number')
  })
})

describe('Boolean validation', () => {
  test('basic', () => {
    expect(fix(true, [bool()])).toBe(true)
    expect(fix(false, [bool()])).toBe(false)
    expect(fix(1, [bool()])).toBe(true)
    expect(fix(0, [bool()])).toBe(false)
    expect(fix('', [bool()])).toBe(false)
    expect(fix('lorem ipsum', [bool()])).toBe(true)
    expect(fix({}, [bool()])).toBe(true)
  })

  test('require option', () => {
    expect(() => fix(undefined, [bool({ require: true })])).toThrow('required')
  })

  test('default option', () => {
    expect(fix(undefined, [bool()])).toBe(false)
    expect(fix(undefined, [bool({ default: undefined })])).toBeUndefined()
    expect(fix(undefined, [bool({ default: true })])).toBe(true)
  })

  test('coerse option', () => {
    expect(() => fix(1, [bool({ coerce: false })])).toThrow('not a boolean')
  })
})

describe('Array validation', () => {
  test('basic', () => {
    expect(fix([true, false], [list({ type: [text()] })])).toEqual(['true', 'false'])
    expect(fix([0, 1], [list({ type: [bool()] })])).toEqual([false, true])
    expect(fix([1, '2', 3], [list({ type: [float()] })])).toEqual([1, 2, 3])
  })

  test('require option', () => {
    expect(() => fix(undefined, [list({ type: [float()], require: true })])).toThrow('required')
  })

  test('default option', () => {
    expect(fix(undefined, [list({ type: [text()] })])).toEqual([])
    expect(fix(undefined, [list({ type: [float()], default: undefined })])).toBeUndefined()
    expect(fix(undefined, [list({ type: [float()], default: [1, 2, 3] })])).toEqual([1, 2, 3])
  })
})

describe('Misc pipelines', () => {
  test('trim', () => {
    expect(fix(' hello there! ', [text(), trim()])).toBe('hello there!')
    expect(() => fix(125.48, [trim()])).toThrow('not a string')
  })

  test('lower', () => {
    expect(fix('Hello There!', [text(), lower()])).toBe('hello there!')
    expect(() => fix(125.48, [lower()])).toThrow('not a string')
  })

  test('upper', () => {
    expect(fix('hello there!', [text(), upper()])).toBe('HELLO THERE!')
    expect(() => fix(125.48, [upper()])).toThrow('not a string')
  })

  test('combined pipelines', () => {
    expect(fix(' Hello There! ', [text(), trim(), lower()])).toBe('hello there!')
    expect(fix(' Hello There! ', [text(), trim(), upper()])).toBe('HELLO THERE!')
  })
})
