const { fix, parse, pipe, error, ok } = require('./index')
const { string, upper, lower, trim, number, boolean, date, array, included } = require('./pipes')

describe('Validate README examples', () => {
  test('General', () => {
    const data = {
      name: 'Stephen',
      middleName: undefined,
      lastName: 'King',
      born: 'September 21, 1947',
      age: '75',
      isMarried: 1,
      childrend: ['Joe Hill', 'Owen King', 'Naomi King'],
      books: [
        { title: 'The Stand', year: 1978, id: 'isbn-9781444720730' },
        { title: 'Salem\'s lot', year: '1975', id: 'isbn-0385007515' }
      ],
      // this property was accidentally passed and
      // will be removed from the fixed data
      metadata: 'console.log(\'please ignore me\')'
    }
  
    const fixedData = fix(data, {
      name: string(),
      middleName: string(),
      lastName: string(),
      born: date(),
      age: number(),
      isMarried: boolean(),
      childrend: array({ of: string() }),
      // array of complex objects
      books: array({
        of: {
          title: string(),
          year: number(),
          // we can combine multiple 'pipes'
          id: [string(), upper()]
        }}
      )
    })
  
    expect(fixedData).toMatchObject({
      name: 'Stephen',
      middleName: '',   // undefined has been replaced by  ''
      lastName: 'King',
      born: '1947-09-20T23:00:00.000Z',
      age: 75,          // '74' has been replaced by 74
      isMarried: true,  // 1 has been replaced by true
      childrend: [ 'Joe Hill', 'Owen King', 'Naomi King' ],
      books: [
        { title: 'The Stand', year: 1978, id: 'ISBN-9781444720730' },
        { title: 'Salem\'s lot', year: 1975, id: 'ISBN-0385007515' }
      ]
      // metadata was ignored
    })
  })

  test('floorPipe', () => {
    const floorPipe = pipe((value) => {
      if (typeof value != 'number') {
        return error('not a number')
      }
    
      return ok(Math.floor(value))
    })
    
    // Note that you can pass "scalar" values to the fix function.
    const data = fix('105.48', [number(), floorPipe()])
    expect(data).toBe(105)
  })

  test('colorPipe', () => {
    const colorPipe = pipe((value) => {
      if (typeof value != 'string' || !value.match(/^#[0-9A-F]{6}$/i)) {
        return error('not a color')
      }
    
      return ok(value)
    })
    
    // note that we are using multiple pipes before applying our custom pipe
    const fixedColor = fix('#ab783F', [string(), upper(), trim(), colorPipe()])
    expect(fixedColor).toBe('#AB783F')
  })

  test('Combine multiple pipes', () => {
    const color = '  #aB4cf7  '
    const fixedColor = fix(color, [string(), trim(), upper()])
    expect(fixedColor).toBe('#AB4CF7')
  })
})

describe('Text validation', () => {
  test('basic', () => {
    expect(fix('hello there!', string())).toBe('hello there!')
    expect(fix(true, string())).toBe('true')
    expect(fix(125.48, string())).toBe('125.48')
  })

  test('required option', () => {
    expect(() => fix(undefined, string({ required: true }))).toThrow('required')
    expect(() => fix('', string({ required: true }))).toThrow('required')
  })

  test('default option', () => {
    expect(fix(undefined, string())).toBe('')
    expect(fix(undefined, string({ default: undefined }))).toBeUndefined()
    expect(fix(undefined, string({ default: 'John Smith' }))).toBe('John Smith')
  })

  test('coerced option', () => {
    expect(() => fix(true, string({ coerced: false }))).toThrow('not a string')
    expect(() => fix(125.48, string({ coerced: false }))).toThrow('not a string')
  })
})

describe('Float validation', () => {
  test('basic', () => {
    expect(fix(125.48, number())).toBe(125.48)
    expect(fix('125.48', number())).toBe(125.48)
    expect(() => fix('lorem ipsum', number())).toThrow('not a number')
  })

  test('required option', () => {
    expect(() => fix(undefined, number({ required: true }))).toThrow('required')
  })

  test('default option', () => {
    expect(fix(undefined, number())).toBe(0)
    expect(fix(undefined, number({ default: undefined }))).toBeUndefined()
    expect(fix(undefined, number({ default: 125.48 }))).toBe(125.48)
  })

  test('coerced option', () => {
    expect(() => fix('125.48', number({ coerced: false }))).toThrow('not a number')
  })
})

describe('Boolean validation', () => {
  test('basic', () => {
    expect(fix(true, boolean())).toBe(true)
    expect(fix(false, boolean())).toBe(false)
    expect(fix(1, boolean())).toBe(true)
    expect(fix(0, boolean())).toBe(false)
    expect(fix('', boolean())).toBe(false)
    expect(fix('lorem ipsum', boolean())).toBe(true)
    expect(fix({}, boolean())).toBe(true)
  })

  test('required option', () => {
    expect(() => fix(undefined, boolean({ required: true }))).toThrow('required')
  })

  test('default option', () => {
    expect(fix(undefined, boolean())).toBe(false)
    expect(fix(undefined, boolean({ default: undefined }))).toBeUndefined()
    expect(fix(undefined, boolean({ default: true }))).toBe(true)
  })

  test('coerced option', () => {
    expect(() => fix(1, boolean({ coerced: false }))).toThrow('not a boolean')
  })
})

describe('Date validation', () => {
  test('basic', () => {
    expect(fix('04 Dec 1995 00:12:00 GMT', date())).toBe('1995-12-04T00:12:00.000Z')
    expect(fix('Wed 1 Feb, 2022', date())).toBe('2022-01-31T23:00:00.000Z')
    expect(fix('2012-07-15', date())).toBe('2012-07-15T00:00:00.000Z')
    expect(fix('2012-07-15 15:48:13', date())).toBe('2012-07-15T13:48:13.000Z')
    expect(fix('2012-07-15 15:48', date())).toBe('2012-07-15T13:48:00.000Z')
  })

  test('required option', () => {
    expect(() => fix(undefined, date({ required: true }))).toThrow('required')
  })

  test('default option', () => {
    const now = new Date().toISOString()
    expect(fix(null, date({ default: now }))).toBe(now)
    expect(fix(null, date({ default: undefined }))).toBeUndefined()
  })
})

describe('Array validation', () => {
  test('basic', () => {
    expect(fix([true, false], array({ of: [string()] }))).toEqual(['true', 'false'])
    expect(fix([0, 1], array({ of: [boolean()] }))).toEqual([false, true])
    expect(fix([1, '2', 3], array({ of: [number()] }))).toEqual([1, 2, 3])
  })

  test('required option', () => {
    expect(() => fix(undefined, array({ of: number(), required: true }))).toThrow('required')
  })

  test('default option', () => {
    expect(fix(undefined, array({ of: string() }))).toEqual([])
    expect(fix(undefined, array({ of: number(), default: undefined }))).toBeUndefined()
    expect(fix(undefined, array({ of: number(), default: [1, 2, 3] }))).toEqual([1, 2, 3])
  })
})

describe('Misc pipelines', () => {
  test('included', () => {
    expect(fix('sold', included({ in: ['sold', 'available']}))).toEqual('sold')
    expect(fix('hello, John', included({ in: ['bye bye', 'hello, John'] }))).toEqual('hello, John')
    expect(() => fix(101, included({ in: ['101', '102']}))).toThrow('not a string')
  })

  test('trim', () => {
    expect(fix(' hello there! ', [string(), trim()])).toBe('hello there!')
    expect(() => fix(125.48, trim())).toThrow('not a string')
  })

  test('lower', () => {
    expect(fix('Hello There!', [string(), lower()])).toBe('hello there!')
    expect(() => fix(125.48, lower())).toThrow('not a string')
  })

  test('upper', () => {
    expect(fix('hello there!', [string(), upper()])).toBe('HELLO THERE!')
    expect(() => fix(125.48, upper())).toThrow('not a string')
  })

  test('combined pipelines', () => {
    expect(fix(' Hello There! ', [string(), trim(), lower()])).toBe('hello there!')
    expect(fix(' Hello There! ', [string(), trim(), upper()])).toBe('HELLO THERE!')
    expect(fix(101, [string(), included({ in: ['101', '102'] })])).toEqual('101')
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
      name: string({ coerced: false }),
      lastName: string({ required: true }),
      pseudonym: [lower(), trim()],
      age: number(),
      single: boolean({ coerced: false }),
      location: { latitude: number(), longitude: number() },
      novels: array({ of: string() }),
    })

    expect(errors).toMatchObject([
      { 'path': 'name', 'error': 'not a string' },
      { 'path': 'lastName', 'error': 'required' },
      { 'path': 'pseudonym', 'error': 'not a string' },
      { 'path': 'age', 'error': 'not a number' },
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

    expect(fix('105.48', [number(), floor()])).toBe(105)
    expect(() => fix('105.48', floor())).toThrow('not a number')
  })
})