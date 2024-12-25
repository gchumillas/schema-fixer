import { fix, createFixer, text, upper, lower, trim, floor, float, bool, list } from './index'

describe('README examples', () => {
  test('main example should fix input data', () => {
    const data = {
      name: 'Stephen',
      middleName: undefined,
      lastName: 'King',
      age: '75',
      isMarried: 1,
      children: ['Joe Hill', 'Owen King', 'Naomi King'],
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
      name: text(),
      middleName: text(),
      lastName: text(),
      age: float(),
      isMarried: bool(),
      // an array of strings
      children: list({ of: text() }),
      // an object
      address: {
        street: text(),
        city: text(),
        state: text()
      },
      // array of objects
      books: list({
        of: {
          title: text(),
          year: float(),
          // combine multiple 'fixers'
          id: [trim(), upper()]
        }
      })
    })

    expect(fixedData).toEqual({
      name: 'Stephen',
      middleName: '',
      lastName: 'King',
      age: 75, // '74' has been replaced by 74
      isMarried: true, // 1 has been replaced by true
      children: ['Joe Hill', 'Owen King', 'Naomi King'],
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

  test('sugar syntax example should fix input data', () => {
    const data = {
      name: 'John',
      age: '35',
      isMarried: 0,
      children: {},
      years: [1954, '2023', 1987],
      items: [1, 0, {}, [], 'false']
    }

    const fixedData = fix(data, {
      name: 'string', // sf.text()
      age: 'number', // sf.float()
      isMarried: 'boolean', // sf.bool()
      children: 'string[]', // sf.list({ of: sf.text() })
      years: 'number[]', // sf.list({ of: sf.float() })
      items: 'boolean[]' // sf.list({ of: sf.bool() })
    })

    expect(fixedData).toEqual({
      name: 'John',
      age: 35,
      isMarried: false,
      children: [],
      years: [1954, 2023, 1987],
      items: [true, false, true, true, true]
    })
  })

  test('API examples should fix input data', () => {
    // A `Schema` can be a 'fixer', a list of 'fixers' or a record of 'fixers'
    expect(fix(1, bool())).toBe(true)
    expect(fix('Hello!', [text(), upper()])).toBe('HELLO!')
    expect(fix({ name: 'John' }, { name: text(), age: float() })).toEqual({
      name: 'John',
      age: 0
    })

    // The `def` parameter indicates the value to return when the 'fixer'
    // cannot fix the incoming data or the data is `null` or `undefined`
    expect(fix(null, text())).toBe('')
    expect(fix(undefined, text({ def: 'aaa' }))).toBe('aaa')
    expect(fix({}, float({ def: 100 }))).toBe(100)

    // The `coerce` parameter indicates that you want to "force" the
    // conversion (default is `true`)
    expect(fix(100, text())).toBe('100')
    expect(fix(100, text({ coerce: false }))).toBe('')

    // The `required` parameter indicates that an incoming value is required
    expect(fix(undefined, float())).toBe(0)
    expect(fix(null, float({ required: false }))).toBeUndefined()
    expect(fix(undefined, text({ required: false }))).toBeUndefined()
  })
})

describe('Custom fixers', () => {
  test('floor fixer should fix input data', () => {
    const floor = createFixer(0, (value) => {
      if (typeof value != 'number') {
        throw TypeError('not a float')
      }

      return Math.floor(value)
    })

    expect(fix('105.48', [float(), floor()])).toBe(105)
    expect(fix('105.48', floor())).toBe(0)
  })

  test('color fixer should fix input data', () => {
    const color = createFixer('#000000', (value: any) => {
      if (typeof value != 'string' || !value.match(/^#[0-9A-F]{6}$/i)) {
        throw new TypeError('not a color')
      }

      return value
    })

    // note that we are using multiple fixers before applying our custom fixer
    const fixedColor = fix('#ab783F', [upper(), trim(), color()])
    expect(fixedColor).toBe('#AB783F')
  })
})

describe('Build-in fixers', () => {
  test('text fixer should fix input data', () => {
    expect(fix('hello there!', text())).toBe('hello there!')
    expect(fix(true, text())).toBe('true')
    expect(fix(false, text())).toBe('false')
    expect(fix(125.48, text())).toBe('125.48')
    expect(fix(undefined, text())).toBe('')
    expect(fix(null, text())).toBe('')

    // with def option
    expect(fix(undefined, text({ def: 'John Smith' }))).toBe('John Smith')
    expect(fix(null, text({ def: 'John Smith' }))).toBe('John Smith')

    // with coerce option
    expect(fix(true, text({ coerce: false }))).toBe('')
    expect(fix(125.48, text({ coerce: false, def: 'xxx' }))).toBe('xxx')
  })

  test('float fixer should fix input data', () => {
    expect(fix(undefined, float())).toBe(0)
    expect(fix(null, float())).toBe(0)
    expect(fix(false, float())).toBe(0)
    expect(fix(true, float())).toBe(1)
    expect(fix(125.48, float())).toBe(125.48)
    expect(fix('125.48', float())).toBe(125.48)
    expect(fix('lorem ipsum', float())).toBe(0)

    // with def option
    expect(fix({}, float({ def: 100 }))).toBe(100)
    expect(fix(undefined, float({ def: 125.48 }))).toBe(125.48)
    expect(fix(null, float({ def: 125.48 }))).toBe(125.48)

    // with coerce option
    expect(fix('125.48', float({ coerce: false }))).toBe(0)
    expect(fix('125.48', float({ coerce: false, def: 100 }))).toBe(100)
  })

  test('bool fixer should fix input data', () => {
    expect(fix(true, bool())).toBe(true)
    expect(fix(false, bool())).toBe(false)
    expect(fix(1, bool())).toBe(true)
    expect(fix(0, bool())).toBe(false)
    expect(fix('', bool())).toBe(false)
    expect(fix('lorem ipsum', bool())).toBe(true)
    expect(fix({}, bool())).toBe(true)
    expect(fix(undefined, bool())).toBe(false)
    expect(fix(null, bool())).toBe(false)

    // with def option
    expect(fix(undefined, bool({ def: true }))).toBe(true)
    expect(fix(null, bool({ def: true }))).toBe(true)

    // with coerce option
    expect(fix(1, bool({ coerce: false }))).toBe(false)
    expect(fix(1, bool({ coerce: false, def: true }))).toBe(true)
  })

  test('list fixer should fix input data', () => {
    expect(fix([true, false], list({ of: text() }))).toEqual(['true', 'false'])
    expect(fix([0, 1], list({ of: bool() }))).toEqual([false, true])
    expect(fix([1, '2', 3], list({ of: float() }))).toEqual([1, 2, 3])
    expect(fix(undefined, list({ of: text() }))).toEqual([])
    expect(fix(null, list({ of: text() }))).toEqual([])

    // with def option
    expect(fix(undefined, list({ of: float(), def: [1, 2, 3] }))).toEqual([1, 2, 3])
    expect(fix(null, list({ of: float(), def: [1, 2, 3] }))).toEqual([1, 2, 3])

    // with required option
    expect(fix(null, list({ required: false, of: text() }))).toBeUndefined()
  })

  test('multiple fixers should fix input data', () => {
    expect(fix(' hello there! ', [text(), trim()])).toBe('hello there!')
    expect(fix(125.48, trim())).toBe('')

    // lower
    expect(fix('Hello There!', [text(), lower()])).toBe('hello there!')
    expect(fix(125.48, lower())).toBe('')

    // upper
    expect(fix('hello there!', [text(), upper()])).toBe('HELLO THERE!')
    expect(fix(125.48, upper())).toBe('')

    // trim
    expect(fix(' Hello There! ', [text(), trim(), lower()])).toBe('hello there!')
    expect(fix(' Hello There! ', [text(), trim(), upper()])).toBe('HELLO THERE!')

    // floor
    expect(fix('100.5', [float(), floor()])).toBe(100)
  })

  test('should fix input data against schema records', () => {
    // none objects
    expect(fix(100, { id: text() })).toEqual({ id: '' })
    expect(fix(true, { id: text() })).toEqual({ id: '' })
    expect(fix('lorem ipsum', { id: text() })).toEqual({ id: '' })

    // object
    expect(
      fix(
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
          name: text({ coerce: false }),
          pseudonym: [lower(), trim()],
          age: float(),
          single: bool({ coerce: false }),
          location: { latitude: float(), longitude: float() },
          novels: list({ of: text() })
        }
      )
    ).toEqual({
      name: '',
      pseudonym: '',
      age: 0,
      single: false,
      location: { latitude: 0, longitude: 0 },
      novels: ['', '']
    })

    expect(
      fix(
        {
          name: 'John Smith',
          address: {
            street: 'Clover alley, 123',
            postalCode: 35000
          }
        },
        {
          name: text(),
          address: {
            street: text(),
            postalCode: text(),
            city: text({ def: 'Portland' })
          }
        }
      )
    ).toEqual({
      name: 'John Smith',
      address: {
        street: 'Clover alley, 123',
        postalCode: '35000',
        city: 'Portland'
      }
    })
  })

  test('should fix invalid input data', () => {
    // invalid strings
    expect(fix({}, text())).toBe('')
    expect(fix({}, text({ def: 'hello!' }))).toBe('hello!')
    expect(fix(100, trim({ def: 'zzz' }))).toBe('zzz')
    expect(fix(100, lower({ def: 'vvv' }))).toBe('vvv')
    expect(fix(100, upper({ def: 'www' }))).toBe('www')

    // invalid numbers
    expect(fix('aaa', float())).toBe(0)
    expect(fix('aaa', float({ def: 100 }))).toBe(100)

    // invalid booleans
    expect(fix({}, bool({ coerce: false }))).toBe(false)
    expect(fix({}, bool({ coerce: false, def: true }))).toBe(true)

    expect(fix('aaa', list({ of: text() }))).toEqual([])
    expect(fix({}, list({ of: float(), def: [1, 2, 3] }))).toEqual([1, 2, 3])
    expect(fix(undefined, list({ required: false, of: float() }))).toBeUndefined()

    // invalid objects
    expect(fix(100, { name: text(), age: float() })).toEqual({ name: '', age: 0 })
    expect(fix(100, { name: text({ def: 'John' }), age: float({ def: 35 }) })).toEqual({ name: 'John', age: 35 })
  })
})

describe('Sugar syntax', () => {
  test('should fix input data against basic schemas', () => {
    expect(fix(100, 'string')).toBe('100')
    expect(fix('100', 'number')).toBe(100)
    expect(fix(1, 'boolean')).toBe(true)
    expect(fix([100, 200, 300], 'string[]')).toEqual(['100', '200', '300'])
    expect(fix(['100', '200', '300'], 'number[]')).toEqual([100, 200, 300])
    expect(fix([1, 0, 1], 'boolean[]')).toEqual([true, false, true])
  })

  test('should fix input data against schema record', () => {
    const data = {
      name: 'Stephen',
      lastName: 'King',
      age: '75',
      isMarried: 1,
      children: ['Joe Hill', 'Owen King', 'Naomi King'],
      address: {
        street: '107-211 Parkview Ave, Bangor, ME 04401, USA',
        city: 'Portland',
        state: 'Oregon'
      },
      books: [
        { title: 'The Stand', year: 1978, id: 'isbn-9781444720730' },
        { title: "Salem's lot", year: '1975', id: 'isbn-0385007515' }
      ],
      items1: [1.5, '2.5', 3.5],
      items2: [1, false, true]
    }

    const fixedData = fix(data, {
      name: 'string',
      lastName: 'string',
      age: 'number',
      isMarried: 'boolean',
      children: 'string[]',
      address: {
        street: 'string',
        city: 'string',
        state: 'string'
      },
      // list of complex objects
      books: list({
        of: {
          title: 'string',
          year: 'number',
          // we can combine multiple 'fixers'
          id: [text(), upper()]
        }
      }),
      items1: 'number[]',
      items2: 'boolean[]'
    })

    expect(fixedData).toEqual({
      name: 'Stephen',
      lastName: 'King',
      age: 75, // '74' has been replaced by 74
      isMarried: true, // 1 has been replaced by true
      children: ['Joe Hill', 'Owen King', 'Naomi King'],
      address: {
        street: '107-211 Parkview Ave, Bangor, ME 04401, USA',
        city: 'Portland',
        state: 'Oregon'
      },
      books: [
        { title: 'The Stand', year: 1978, id: 'ISBN-9781444720730' },
        { title: "Salem's lot", year: 1975, id: 'ISBN-0385007515' }
      ],
      items1: [1.5, 2.5, 3.5],
      items2: [true, false, true]
    })
  })
})
