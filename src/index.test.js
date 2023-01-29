const { fix, parse, pipe, error, ok } = require('./index')
const { string, upper, number, boolean, array, select } = require('./pipes')

describe('General', () => {
  test('Validate README example', () => {
    const data = {
      name: 'Stephen',
      middleName: undefined,
      lastName: 'King',
      age: '74',
      isMarried: 1,
      childrend: ['Joe Hill', 'Owen King', 'Naomi King'],
      books: [
        { title: 'The Stand', year: 1978, id: 'isbn-9781444720730' },
        { title: 'Salem\'s lot', year: '1975', id: 'isbn-0385007515' }
      ],
      // this additional property was accidentally passed
      metadata: 'console.log(\'please ignore me\')'
    }
  
    const fixedData = fix(data, {
      name: string(),
      middleName: string(),
      lastName: string(),
      age: number(),
      isMarried: boolean(),
      childrend: array({
        type: string()
      }),
      books: array({
        type: { // type can be a complex schema
          title: string(),
          year: number(),
          id: [string(), upper()] // we can apply two `pipes`
        }
      })
    })
  
    expect(fixedData).toMatchObject({
      name: 'Stephen',
      middleName: '',   // undefined has been replaced by  ''
      lastName: 'King',
      age: 74,          // '74' has been replaced by 74
      isMarried: true,  // 1 has been replaced by true
      childrend: [ 'Joe Hill', 'Owen King', 'Naomi King' ],
      books: [
        { title: 'The Stand', year: 1978, id: 'ISBN-9781444720730' },
        { title: 'Salem\'s lot', year: 1975, id: 'ISBN-0385007515' }
      ]
      // metadata was ignored
    })
  })
})

describe('Text validation', () => {
  test('basic', () => {
    expect(fix('hello there!', string())).toBe('hello there!')
    expect(fix(true, string())).toBe('true')
    expect(fix(125.48, string())).toBe('125.48')
  })

  test('require option', () => {
    expect(() => fix(undefined, string({ require: true }))).toThrow('required')
    expect(() => fix('', string({ require: true }))).toThrow('required')
  })

  test('default option', () => {
    expect(fix(undefined, string())).toBe('')
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
    expect(fix(125.48, 'number')).toBe(125.48)
    expect(fix('125.48', 'number')).toBe(125.48)
    expect(() => fix('lorem ipsum', 'number')).toThrow('not a number')
  })

  test('require option', () => {
    expect(() => fix(undefined, number({ require: true }))).toThrow('required')
  })

  test('default option', () => {
    expect(fix(undefined, 'number')).toBe(0)
    expect(fix(undefined, number({ default: undefined }))).toBeUndefined()
    expect(fix(undefined, number({ default: 125.48 }))).toBe(125.48)
  })

  test('coerce option', () => {
    expect(() => fix('125.48', number({ coerce: false }))).toThrow('not a number')
  })
})

describe('Boolean validation', () => {
  test('basic', () => {
    expect(fix(true, 'boolean')).toBe(true)
    expect(fix(false, 'boolean')).toBe(false)
    expect(fix(1, 'boolean')).toBe(true)
    expect(fix(0, 'boolean')).toBe(false)
    expect(fix('', 'boolean')).toBe(false)
    expect(fix('lorem ipsum', 'boolean')).toBe(true)
    expect(fix({}, 'boolean')).toBe(true)
  })

  test('require option', () => {
    expect(() => fix(undefined, boolean({ require: true }))).toThrow('required')
  })

  test('default option', () => {
    expect(fix(undefined, 'boolean')).toBe(false)
    expect(fix(undefined, boolean({ default: undefined }))).toBeUndefined()
    expect(fix(undefined, boolean({ default: true }))).toBe(true)
  })

  test('coerse option', () => {
    expect(() => fix(1, boolean({ coerce: false }))).toThrow('not a boolean')
  })
})

describe('Array validation', () => {
  test('basic', () => {
    expect(fix([true, false], 'string[]')).toEqual(['true', 'false'])
    expect(fix([0, 1], 'boolean[]')).toEqual([false, true])
    expect(fix([1, '2', 3], 'number[]')).toEqual([1, 2, 3])
  })

  test('require option', () => {
    expect(() => fix(undefined, array({ type: 'number', require: true }))).toThrow('required')
  })

  test('default option', () => {
    expect(fix(undefined, 'string[]')).toEqual([])
    expect(fix(undefined, array({ type: 'number', default: undefined }))).toBeUndefined()
    expect(fix(undefined, array({ type: 'number', default: [1, 2, 3] }))).toEqual([1, 2, 3])
  })
})

describe('Misc pipelines', () => {
  test('select', () => {
    expect(fix('sold', '[sold, available]')).toEqual('sold')
    expect(fix('hello, John', select({ options: ['bye bye', 'hello, John'] }))).toEqual('hello, John')
    expect(() => fix(101, '[101, 202]')).toThrow('not a string')
  })

  test('trim', () => {
    expect(fix(' hello there! ', [string(), 'trim'])).toBe('hello there!')
    expect(() => fix(125.48, 'trim')).toThrow('not a string')
  })

  test('lower', () => {
    expect(fix('Hello There!', [string(), 'lower'])).toBe('hello there!')
    expect(() => fix(125.48, 'lower')).toThrow('not a string')
  })

  test('upper', () => {
    expect(fix('hello there!', [string(), upper()])).toBe('HELLO THERE!')
    expect(() => fix(125.48, upper())).toThrow('not a string')
  })

  test('combined pipelines', () => {
    expect(fix(' Hello There! ', [string(), 'trim', 'lower'])).toBe('hello there!')
    expect(fix(' Hello There! ', [string(), 'trim', upper()])).toBe('HELLO THERE!')
    expect(fix(101, [string(), '[101, 202]'])).toEqual('101')
  })
})

describe('Object validation', () => {
  test('check errors', () => {
    expect(() => fix(100, { id: string() })).toThrow('not an object')
    expect(() => fix(true, { id: string() })).toThrow('not an object')
    expect(() => fix('lorem ipsum', { id: string() })).toThrow('not an object')

    const [, errors] = parse({
      name: 125.48,
      lastName: '',
      pseudonym: 78945,
      age: 'old',
      single: 1,
      location: 102,
      novels: [
        { title: 'Book 1', year: 2011 },
        { title: 'Book 2', year: 2012 }
      ]
    }, {
      name: string({ coerce: false }),
      lastName: string({ require: true }),
      pseudonym: ['lower', 'trim'],
      age: 'float',
      single: boolean({ coerce: false }),
      location: { latitude: 'number', longitude: 'number' },
      novels: 'string[]',
    })

    expect(errors).toMatchObject([
      { 'path': 'name', 'error': 'not a string' },
      { 'path': 'lastName', 'error': 'required' },
      { 'path': 'pseudonym', 'error': 'not a string' },
      { 'path': 'age', 'error': 'unrecognized float pipe' },
      { 'path': 'single', 'error': 'not a boolean' },
      { 'path': 'location', 'error': 'not an object' },
      {
        'path': 'novels', 'error': [
          { 'path': 'novels[0]', 'error': 'not a string' },
          { 'path': 'novels[1]', 'error': 'not a string' }
        ]
      }
    ])
  })
})

describe('Custom pipes', () => {
  test('floor pipe', () => {
    const floor = pipe(value => {
      if (typeof value != 'number') {
        return error('not a number')
      }

      return ok(Math.floor(value))
    })

    expect(fix('105.48', ['number', floor()])).toBe(105)
    expect(() => fix('105.48', floor())).toThrow('not a number')
  })
})
