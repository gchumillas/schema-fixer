import { fix, createFixer, text, upper, lower, trim, float, bool, list } from './index'

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
      name: text(),
      middleName: text({ required: false }),
      lastName: text(),
      age: float(),
      isMarried: bool(),
      childrend: list({ of: text() }),
      address: {
        street: text(),
        city: text(),
        state: text()
      },
      // list of complex objects
      books: list({
        of: {
          title: text(),
          year: float(),
          // we can combine multiple 'parsers'
          id: [text(), upper()]
        }
      })
    })

    expect(fixedData).toMatchObject({
      name: 'Stephen',
      middleName: undefined,
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
        throw new Error('not a float')
      }

      return Math.floor(value)
    }

    // Note that you can pass "scalar" values to the fix function.
    const data = fix('105.48', [float(), floorParser()])
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
    const fixedColor = fix('#ab783F', [upper(), trim(), colorParser()])
    expect(fixedColor).toBe('#AB783F')
  })

  test('Combine multiple parsers', () => {
    const color = '  #aB4cf7  '
    const fixedColor = fix(color, [text(), trim(), upper()])
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
      name: text(),
      address: {
        street: text(),
        postalCode: text(),
        city: text({ def: 'Portland' })
      }
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
})

describe('Text validation', () => {
  test('basic', () => {
    expect(fix('hello there!', text())).toBe('hello there!')
    expect(fix(true, text())).toBe('true')
    expect(fix(false, text())).toBe('false')
    expect(fix(125.48, text())).toBe('125.48')
  })

  test('def option', () => {
    expect(fix(undefined, text())).toBe('')
    expect(fix(null, text())).toBe('')
    expect(fix(undefined, text({ def: 'John Smith' }))).toBe('John Smith')
    expect(fix(null, text({ def: 'John Smith' }))).toBe('John Smith')
  })

  test('coerce option', () => {
    expect(fix(true, text({ coerce: false }))).toBe('')
    expect(fix(125.48, text({ coerce: false, def: 'xxx' }))).toBe('xxx')
  })
})

describe('Float validation', () => {
  test('basic', () => {
    expect(fix(undefined, float())).toBe(0)
    expect(fix(null, float())).toBe(0)
    expect(fix(false, float())).toBe(0)
    expect(fix(true, float())).toBe(1)
    expect(fix(125.48, float())).toBe(125.48)
    expect(fix('125.48', float())).toBe(125.48)
    expect(fix('lorem ipsum', float())).toBe(0)
  })

  test('def option', () => {
    expect(fix({}, float({ def: 100 }))).toBe(100)
    expect(fix(undefined, float({ def: 125.48 }))).toBe(125.48)
    expect(fix(null, float({ def: 125.48 }))).toBe(125.48)
  })

  test('coerce option', () => {
    expect(fix('125.48', float({ coerce: false }))).toBe(0)
    expect(fix('125.48', float({ coerce: false, def: 100 }))).toBe(100)
  })
})

describe('Boolean validation', () => {
  test('basic', () => {
    expect(fix(true, bool())).toBe(true)
    expect(fix(false, bool())).toBe(false)
    expect(fix(1, bool())).toBe(true)
    expect(fix(0, bool())).toBe(false)
    expect(fix('', bool())).toBe(false)
    expect(fix('lorem ipsum', bool())).toBe(true)
    expect(fix({}, bool())).toBe(true)
  })

  test('def option', () => {
    expect(fix(undefined, bool())).toBe(false)
    expect(fix(null, bool())).toBe(false)
    expect(fix(undefined, bool({ def: true }))).toBe(true)
    expect(fix(null, bool({ def: true }))).toBe(true)
  })

  test('coerce option', () => {
    expect(fix(1, bool({ coerce: false }))).toBe(false)
    expect(fix(1, bool({ coerce: false, def: true }))).toBe(true)
  })
})

describe('Array validation', () => {
  test('basic', () => {
    expect(fix([true, false], list({ of: text() }))).toEqual(['true', 'false'])
    expect(fix([0, 1], list({ of: bool() }))).toEqual([false, true])
    expect(fix([1, '2', 3], list({ of: float() }))).toEqual([1, 2, 3])
    expect(fix(null, list({ required: false, of: text() }))).toBeUndefined()
  })

  test('def option', () => {
    expect(fix(undefined, list({ of: text() }))).toEqual([])
    expect(fix(null, list({ of: text() }))).toEqual([])
    expect(fix(undefined, list({ of: float(), def: [1, 2, 3] }))).toEqual([1, 2, 3])
    expect(fix(null, list({ of: float(), def: [1, 2, 3] }))).toEqual([1, 2, 3])
  })
})

describe('Combine multiple parsers', () => {
  test('trim', () => {
    expect(fix(' hello there! ', [text(), trim()])).toBe('hello there!')
    expect(fix(125.48, trim())).toBe('')
  })

  test('lower', () => {
    expect(fix('Hello There!', [text(), lower()])).toBe('hello there!')
    expect(fix(125.48, lower())).toBe('')
  })

  test('upper', () => {
    expect(fix('hello there!', [text(), upper()])).toBe('HELLO THERE!')
    expect(fix(125.48, upper())).toBe('')
  })

  test('combined parsers', () => {
    expect(fix(' Hello There! ', [text(), trim(), lower()])).toBe('hello there!')
    expect(fix(' Hello There! ', [text(), trim(), upper()])).toBe('HELLO THERE!')
  })
})

describe('Object validation', () => {
  test('check errors', () => {
    expect(fix(100, { id: text() })).toEqual({ id: '' })
    expect(fix(true, { id: text() })).toEqual({ id: '' })
    expect(fix('lorem ipsum', { id: text() })).toEqual({ id: '' })

    const data = fix(
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

    expect(data).toEqual({
      name: '',
      pseudonym: '',
      age: 0,
      single: false,
      location: { latitude: 0, longitude: 0 },
      novels: ['', '']
    })
  })
})

describe('Custom parsers', () => {
  test('floor parser', () => {
    const floor = createFixer(0, (value) => {
      if (typeof value != 'number') {
        throw TypeError('not a float')
      }

      return Math.floor(value)
    })

    expect(fix('105.48', [float(), floor()])).toBe(105)
    expect(fix('105.48', floor())).toBe(0)
  })
})

describe('fix invalid data', () => {
  test('invalid strings', () => {
    const x = fix({}, text())
    expect(x).toBe('')

    const y = fix({}, text({ def: 'hello!' }))
    expect(y).toBe('hello!')

    const z = fix(100, trim({ def: 'zzz' }))
    expect(z).toBe('zzz')

    const v = fix(100, lower({ def: 'vvv' }))
    expect(v).toBe('vvv')

    const w = fix(100, upper({ def: 'www' }))
    expect(w).toBe('www')
  })

  test('invalid numbers', () => {
    const x = fix('aaa', float())
    expect(x).toBe(0)

    const y = fix('aaa', float({ def: 100 }))
    expect(y).toBe(100)
  })

  test('invalid booleans', () => {
    const x = fix({}, bool({ coerce: false }))
    expect(x).toBe(false)

    const y = fix({}, bool({ coerce: false, def: true }))
    expect(y).toBe(true)
  })

  test('invalid arrays', () => {
    const x = fix('aaa', list({ of: text() }))
    expect(x).toEqual([])

    const y = fix({}, list({ of: float(), def: [1, 2, 3] }))
    expect(y).toEqual([1, 2, 3])

    const z = fix(undefined, list({ required: false, of: float() }))
    expect(z).toBeUndefined()
  })

  test('invalid objects', () => {
    const x = fix(100, { name: text(), age: float() })
    expect(x).toEqual({ name: '', age: 0 })

    const y = fix(100, { name: text({ def: 'John' }), age: float({ def: 35 }) })
    expect(y).toEqual({ name: 'John', age: 35 })
  })
})
