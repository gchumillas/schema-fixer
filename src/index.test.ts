import {
  fix, parse,
  string, upper, lower, trim, number, boolean, array,
  schema, join
} from './index'

describe('Validate README examples', () => {
  test('General', () => {
    const data = {
      name: 'Stephen',
      middleName: undefined,
      lastName: 'King',
      age: '75',
      isMarried: 1,
      childrend: ['Joe Hill', 'Owen King', 'Naomi King'],
      address: {
        street: '107-211 Parkview Ave, Bangor, ME 04401, USA',
        city: 'Portland',
        state: 'Oregon'
      },
      books: [
        { title: 'The Stand', year: 1978, id: 'isbn-9781444720730' },
        { title: "Salem's lot", year: '1975', id: 'isbn-0385007515' }
      ],
      // this property was accidentally passed and
      // will be removed from the fixed data
      metadata: "console.log('please ignore me')"
    }

    const fixedData = fix(data, {
      name: string(),
      middleName: string(),
      lastName: string(),
      age: number(),
      isMarried: boolean(),
      childrend: array({ of: string() }),
      address: schema({
        street: string(),
        city: string(),
        state: string()
      }),
      // array of complex objects
      books: array({
        of: {
          title: string(),
          year: number(),
          // we can combine multiple 'parsers'
          id: join(string(), upper())
        }
      })
    })

    expect(fixedData).toMatchObject({
      name: 'Stephen',
      middleName: '', // undefined has been replaced by  ''
      lastName: 'King',
      age: 75, // '74' has been replaced by 74
      isMarried: true, // 1 has been replaced by true
      childrend: ['Joe Hill', 'Owen King', 'Naomi King'],
      address: {
        street: '107-211 Parkview Ave, Bangor, ME 04401, USA',
        city: 'Portland',
        state: 'Oregon'
      },
      books: [
        { title: 'The Stand', year: 1978, id: 'ISBN-9781444720730' },
        { title: "Salem's lot", year: 1975, id: 'ISBN-0385007515' }
      ]
      // metadata was ignored
    })
  })

  test('floorParser', () => {
    const floorParser = () => (value: any) => {
      if (typeof value != 'number') {
        throw new Error('not a number')
      }

      return Math.floor(value)
    }

    // Note that you can pass "scalar" values to the fix function.
    const data = fix('105.48', join(number(), floorParser()))
    expect(data).toBe(105)
  })

  test('colorParser', () => {
    const colorParser = () => (value: any) => {
      if (typeof value != 'string' || !value.match(/^#[0-9A-F]{6}$/i)) {
        throw new Error('not a color')
      }

      return value
    }

    // note that we are using multiple parsers before applying our custom parser
    const fixedColor = fix('#ab783F', join(upper(), trim(), colorParser()))
    expect(fixedColor).toBe('#AB783F')
  })

  test('Combine multiple parsers', () => {
    const color = '  #aB4cf7  '
    const fixedColor = fix(color, join(string(), trim(), upper()))
    expect(fixedColor).toBe('#AB4CF7')
  })
})

describe('Nested validations', () => {
  test('General', () => {
    const data = {
      name: 'John Smith',
      address: {
        street: 'Clover alley, 123',
        postalCode: 35000
      }
    }

    const fixedData = fix(data, {
      name: string(),
      address: schema({
        street: string(),
        postalCode: string(),
        city: string({ default: 'Portland' })
      })
    })

    expect(fixedData).toMatchObject({
      name: 'John Smith',
      address: {
        street: 'Clover alley, 123',
        postalCode: '35000',
        city: 'Portland'
      }
    })
  })

  test('with aliases', () => {
    expect(fix(100, schema(string()))).toBe('100')
    expect(fix(undefined, schema(string()))).toBe('')
    expect(fix('hello there!', schema(string()))).toBe('hello there!')
    expect(fix('   Hello there!   ', schema(join(string(), trim(), lower())))).toBe('hello there!')
    expect(fix('100', schema(number()))).toBe(100)
    expect(fix(undefined, schema(number()))).toBe(0)
  })
})

describe('Text validation', () => {
  test('basic', () => {
    expect(fix('hello there!', string())).toBe('hello there!')
    expect(fix(true, string())).toBe('true')
    expect(fix(false, string())).toBe('false')
    expect(fix(125.48, string())).toBe('125.48')
  })

  test('default option', () => {
    expect(fix(undefined, string())).toBe('')
    expect(fix(null, string())).toBe('')
    expect(fix(undefined, string({ default: 'John Smith' }))).toBe('John Smith')
    expect(fix(null, string({ default: 'John Smith' }))).toBe('John Smith')
  })

  test('coerced option', () => {
    expect(() => fix(true, string({ coerced: false }))).toThrow('not a string')
    expect(() => fix(125.48, string({ coerced: false }))).toThrow('not a string')
  })
})

describe('Float validation', () => {
  test('basic', () => {
    expect(fix(undefined, number())).toBe(0)
    expect(fix(null, number())).toBe(0)
    expect(fix(false, number())).toBe(0)
    expect(fix(true, number())).toBe(1)
    expect(fix(125.48, number())).toBe(125.48)
    expect(fix('125.48', number())).toBe(125.48)
    expect(() => fix('lorem ipsum', number())).toThrow('not a number')
  })

  test('default option', () => {
    expect(fix('', number({ default: 100 }))).toBe(100)
    expect(fix(undefined, number({ default: 125.48 }))).toBe(125.48)
    expect(fix(null, number({ default: 125.48 }))).toBe(125.48)
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

  test('default option', () => {
    expect(fix(undefined, boolean())).toBe(false)
    expect(fix(null, boolean())).toBe(false)
    expect(fix(undefined, boolean({ default: true }))).toBe(true)
    expect(fix(null, boolean({ default: true }))).toBe(true)
  })

  test('coerced option', () => {
    expect(() => fix(1, boolean({ coerced: false }))).toThrow('not a boolean')
  })
})

describe('Array validation', () => {
  test('basic', () => {
    expect(fix([true, false], array({ of: string() }))).toEqual(['true', 'false'])
    expect(fix([0, 1], array({ of: boolean() }))).toEqual([false, true])
    expect(fix([1, '2', 3], array({ of: number() }))).toEqual([1, 2, 3])
  })

  test('default option', () => {
    expect(fix(undefined, array({ of: string() }))).toEqual([])
    expect(fix(null, array({ of: string() }))).toEqual([])
    expect(fix(undefined, array({ of: number(), default: [1, 2, 3] }))).toEqual([1, 2, 3])
    expect(fix(null, array({ of: number(), default: [1, 2, 3] }))).toEqual([1, 2, 3])
  })
})

describe('Combine multiple parsers', () => {
  test('trim', () => {
    expect(fix(' hello there! ', join(string(), trim()))).toBe('hello there!')
    expect(() => fix(125.48, trim())).toThrow('not a string')
  })

  test('lower', () => {
    expect(fix('Hello There!', join(string(), lower()))).toBe('hello there!')
    expect(() => fix(125.48, lower())).toThrow('not a string')
  })

  test('upper', () => {
    expect(fix('hello there!', join(string(), upper()))).toBe('HELLO THERE!')
    expect(() => fix(125.48, upper())).toThrow('not a string')
  })

  test('combined parsers', () => {
    expect(fix(' Hello There! ', join(string(), trim(), lower()))).toBe('hello there!')
    expect(fix(' Hello There! ', join(string(), trim(), upper()))).toBe('HELLO THERE!')
  })
})

describe('Object validation', () => {
  test('check errors', () => {
    expect(() => fix(100, { id: string() })).toThrow('not an object')
    expect(() => fix(true, { id: string() })).toThrow('not an object')
    expect(() => fix('lorem ipsum', { id: string() })).toThrow('not an object')

    const [, errors] = parse(
      {
        name: 125.48,
        pseudonym: 78945,
        age: 'old',
        single: 1,
        location: 102,
        novels: [
          { title: 'Book 1', year: 2011 },
          { title: 'Book 2', year: 2012 }
        ]
      },
      {
        name: string({ coerced: false }),
        pseudonym: join(lower(), trim()),
        age: number(),
        single: boolean({ coerced: false }),
        location: schema({ latitude: number(), longitude: number() }),
        novels: array({ of: string() })
      }
    )

    expect(errors).toMatchObject([
      { 'path': 'name', 'error': 'not a string' },
      { 'path': 'pseudonym', 'error': 'not a string' },
      { 'path': 'age', 'error': 'not a number' },
      { 'path': 'single', 'error': 'not a boolean' },
      { 'path': 'location', 'error': 'not an object' },
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

describe('Custom parsers', () => {
  test('floor parser', () => {
    const floor = () => (value: any) => {
      if (typeof value != 'number') {
        throw new Error('not a number')
      }

      return Math.floor(value)
    }

    expect(fix('105.48', join(number(), floor()))).toBe(105)
    expect(() => fix('105.48', floor())).toThrow('not a number')
  })
})

describe('default & required options', () => {
  test('string', () => {
    const emptyValues = [undefined, null, '']
    for (const emptyValue of emptyValues) {
      // required: false, default: undefined
      expect(fix(emptyValue, string({ required: false, default: undefined }))).toBeUndefined()

      // required: false, default: !undefined
      expect(fix(emptyValue, string({ required: false, default: 'hello!' }))).toBe('hello!')
      expect(fix(emptyValue, string({ required: false }))).toBe('')

      // required: true, default: undefined
      expect(() => fix(emptyValue, string({ required: true, default: undefined }))).toThrow('required')
      expect(() => fix(emptyValue, string({ default: undefined }))).toThrow('required')

      // required: true, default: !undefined
      expect(fix(emptyValue, string({ required: true, default: 'hello!' }))).toBe('hello!')
      expect(fix(emptyValue, string({ default: 'hello!' }))).toBe('hello!')
      expect(fix(emptyValue, string())).toBe('')
    }
  })

  test('number', () => {
    const emptyValues = [undefined, null, '']
    for (const emptyValue of emptyValues) {
      // required: false, default: undefined
      expect(fix(emptyValue, number({ required: false, default: undefined }))).toBeUndefined()

      // required: false, default: !undefined
      expect(fix(emptyValue, number({ required: false, default: 123 }))).toBe(123)
      expect(fix(emptyValue, number({ required: false }))).toBe(0)

      // required: true, default: undefined
      expect(() => fix(emptyValue, number({ required: true, default: undefined }))).toThrow('required')
      expect(() => fix(emptyValue, number({ default: undefined }))).toThrow('required')

      // required: true, default: !undefined
      expect(fix(emptyValue, number({ required: true, default: 123 }))).toBe(123)
      expect(fix(emptyValue, number({ default: 123 }))).toBe(123)
      expect(fix(emptyValue, number())).toBe(0)
    }
  })

  test('boolean', () => {
    const emptyValues = [undefined, null, '']
    for (const emptyValue of emptyValues) {
      // required: false, default: undefined
      expect(fix(emptyValue, boolean({ required: false, default: undefined }))).toBeUndefined()

      // required: false, default: !undefined
      expect(fix(emptyValue, boolean({ required: false, default: true }))).toBe(true)
      expect(fix(emptyValue, boolean({ required: false }))).toBe(false)

      // required: true, default: undefined
      expect(() => fix(emptyValue, boolean({ required: true, default: undefined }))).toThrow('required')
      expect(() => fix(emptyValue, boolean({ default: undefined }))).toThrow('required')

      // required: true, default: !undefined
      expect(fix(emptyValue, boolean({ required: true, default: true }))).toBe(true)
      expect(fix(emptyValue, boolean({ default: true }))).toBe(true)
      expect(fix(emptyValue, boolean())).toBe(false)
    }
  })

  test('array', () => {
    const parsers = [
      { parser: string(), default: ['aaa', 'bbb', 'ccc'] },
      { parser: number(), default: [1, 2, 3] },
      { parser: boolean(), default: [false, true] }
    ]
    const emptyValues = [undefined, null, '']
    for (const emptyValue of emptyValues) {
      for (const { parser, default: defValue } of parsers) {
        // required: false, default: undefined
        expect(fix(emptyValue, array({ of: parser, required: false, default: undefined }))).toBeUndefined()

        // required: false, default: !undefined
        expect(fix(emptyValue, array({ of: parser, required: false, default: defValue }))).toEqual(defValue)
        expect(fix(emptyValue, array({ of: parser, required: false }))).toEqual([])

        // required: true, default: undefined
        expect(() => fix(emptyValue, array({ of: parser, required: true, default: undefined }))).toThrow('required')
        expect(() => fix(emptyValue, array({ of: parser, default: undefined }))).toThrow('required')

        // required: true, default: !undefined
        expect(fix(emptyValue, array({ of: parser, required: true, default: defValue }))).toEqual(defValue)
        expect(fix(emptyValue, array({ of: parser, default: defValue }))).toEqual(defValue)
        expect(fix(emptyValue, array({ of: parser }))).toEqual([])
      }
    }
  })
})
