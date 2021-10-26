const { fix, parse } = require('./index')
const { string, float, bool, list } = require('./pipes')

describe('Text validation', () => {
  test('basic', () => {
    expect(fix('hello there!', 'string')).toBe('hello there!')
    expect(fix(true, 'string')).toBe('true')
    expect(fix(125.48, 'string')).toBe('125.48')
  })

  test('require option', () => {
    expect(() => fix(undefined, string({ require: true }))).toThrow('required')
    expect(() => fix('', string({ require: true }))).toThrow('required')
  })

  test('default option', () => {
    expect(fix(undefined, 'string')).toBe('')
    expect(fix(undefined, string({ default: undefined }))).toBeUndefined()
    expect(fix(undefined, string({ default: 'John Smith' }))).toBe('John Smith')
  })

  test('coerce option', () => {
    expect(() => fix(true, string({ coerce: false }))).toThrow('not a string')
    expect(() => fix(125.48, string({ coerce: false }))).toThrow('not a string')
  })
})

describe('Float validation', () => {
  test('basic', () => {
    expect(fix(125.48, 'float')).toBe(125.48)
    expect(fix('125.48', 'float')).toBe(125.48)
    expect(() => fix('lorem ipsum', 'float')).toThrow('not a number')
  })

  test('require option', () => {
    expect(() => fix(undefined, float({ require: true }))).toThrow('required')
  })

  test('default option', () => {
    expect(fix(undefined, 'float')).toBe(0)
    expect(fix(undefined, float({ default: undefined }))).toBeUndefined()
    expect(fix(undefined, float({ default: 125.48 }))).toBe(125.48)
  })

  test('coerce option', () => {
    expect(() => fix('125.48', float({ coerce: false }))).toThrow('not a number')
  })
})

describe('Boolean validation', () => {
  test('basic', () => {
    expect(fix(true, 'bool')).toBe(true)
    expect(fix(false, 'bool')).toBe(false)
    expect(fix(1, 'bool')).toBe(true)
    expect(fix(0, 'bool')).toBe(false)
    expect(fix('', 'bool')).toBe(false)
    expect(fix('lorem ipsum', 'bool')).toBe(true)
    expect(fix({}, 'bool')).toBe(true)
  })

  test('require option', () => {
    expect(() => fix(undefined, bool({ require: true }))).toThrow('required')
  })

  test('default option', () => {
    expect(fix(undefined, 'bool')).toBe(false)
    expect(fix(undefined, bool({ default: undefined }))).toBeUndefined()
    expect(fix(undefined, bool({ default: true }))).toBe(true)
  })

  test('coerse option', () => {
    expect(() => fix(1, bool({ coerce: false }))).toThrow('not a boolean')
  })
})

describe('Array validation', () => {
  test('basic', () => {
    expect(fix([true, false], 'string[]')).toEqual(['true', 'false'])
    expect(fix([0, 1], 'bool[]')).toEqual([false, true])
    expect(fix([1, '2', 3], 'float[]')).toEqual([1, 2, 3])
  })

  test('require option', () => {
    expect(() => fix(undefined, list({ type: ['float'], require: true }))).toThrow('required')
  })

  test('default option', () => {
    expect(fix(undefined, 'string[]')).toEqual([])
    expect(fix(undefined, list({ type: ['float'], default: undefined }))).toBeUndefined()
    expect(fix(undefined, list({ type: ['float'], default: [1, 2, 3] }))).toEqual([1, 2, 3])
  })
})

describe('Misc pipelines', () => {
  test('trim', () => {
    expect(fix(' hello there! ', ['string', 'trim'])).toBe('hello there!')
    expect(() => fix(125.48, 'trim')).toThrow('not a string')
  })

  test('lower', () => {
    expect(fix('Hello There!', ['string', 'lower'])).toBe('hello there!')
    expect(() => fix(125.48, 'lower')).toThrow('not a string')
  })

  test('upper', () => {
    expect(fix('hello there!', ['string', 'upper'])).toBe('HELLO THERE!')
    expect(() => fix(125.48, 'upper')).toThrow('not a string')
  })

  test('combined pipelines', () => {
    expect(fix(' Hello There! ', ['string', 'trim', 'lower'])).toBe('hello there!')
    expect(fix(' Hello There! ', ['string', 'trim', 'upper'])).toBe('HELLO THERE!')
  })
})

describe('Errors validation', () => {
  test('check errors', () => {
    const [, errors] = parse({
      name: 125.48,
      lastName: '',
      pseudonym: 78945,
      age: 'old',
      single: 1,
      novels: [
        { title: 'Book 1', year: 2011 },
        { title: 'Book 2', year: 2012 }
      ]
    }, {
      name: string({ coerce: false }),
      lastName: string({ require: true }),
      pseudonym: ['lower', 'trim'],
      age: 'float',
      single: bool({ coerce: false }),
      novels: list({ type: 'string' }),
    })

    expect(errors).toEqual([
      { 'path': 'name', 'error': 'not a string' },
      { 'path': 'lastName', 'error': 'required' },
      { 'path': 'pseudonym', 'error': 'not a string' },
      { 'path': 'age', 'error': 'not a number' },
      { 'path': 'single', 'error': 'not a boolean' },
      {
        'path': 'novels',
        'error': [
          { 'path': 'novels[0]', 'error': 'not a string' },
          { 'path': 'novels[1]', 'error': 'not a string' }
        ]
      }
    ])
  })
})
