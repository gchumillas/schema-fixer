> A small library to fix data with full TypeScript support.

**What is this?** It's a fixer. It fixes "any data" preserving the types. **What is this not?** It's not a parser or a validator. Just a fixer. **Why?** Because you don't want to deal with `null` or `undefined` values ​​or invalid data formats that can break your application.

Key features:

- Never fails. It can fix any data against a given schema.
- Infers types from the schema.
- Transforms `null` and `undefined` ​​to default values.
- Excludes unwanted properties to prevent code injection.

### Example

In the following example we obtain the data from an external API and ensure that it conforms to the expected format:

```ts
import sf from '@gchumillas/schema-fixer'

// unwanted `null` and `undefined` values are transformed to '', 0, [], etc.
// no need to indicate the return type, since it is inferred from the schema
function getAuthor = async (authorId: string) => {
  const res = await axios.get(`/api/v1/authors/${authorId}`)

  // 'fixes' the data against a given 'schema'
  return sf.fix(res.data, {
    name: sf.text(),
    middleName: sf.text(),
    lastName: sf.text(),
    age: sf.float(),
    isMarried: sf.bool(),
    // an array of strings
    childrend: sf.list({ of: sf.text() }),
    // an object
    address: {
      street: sf.text(),
      city: sf.text(),
      state: sf.text()
    },
    // array of objects
    books: sf.list({ of: {
      title: sf.text(),
      year: sf.float(),
      // combine multiple 'fixers'
      id: [sf.trim(), sf.upper()]
    }})
  })
}
```

## Install

Simply execute the following command from your project directory:

```bash
npm install @gchumillas/schema-fixer
```

and import the library:

```js
import sf from '@gchumillas/schema-fixer'
```

## API

```js
fix(data, schema)        // fixes 'any data' againts a given schema
createFixer(def, fixer)  // creates a custom fixer

// built-in fixers
text({ def = '', required = true, coerce = true })     // fixes a string
float({ def = 0, required = true, coerce = true })     // fixes a number
bool({ def = false, required = true, coerce = true })  // fixes a boolean
list({ of: Schema, def = [], required = true })        // fixes an array

// additional built-in fixers
trim({ def = '', required = true })                    // trims a string
lower({ def = '', required = true })                   // lowercases a string
upper({ def = '', required = true })                   // uppercases a string
```

- A 'fixer' is the function that fixes the incoming data.

- A `Schema` can be a 'fixer', a list of 'fixers' or a record of 'fixers'. For example:

```js
fix(1, bool()) // true
fix('Hello!', [text(), upper()]) // 'HELLO!'
fix({ name: 'John' }, { name: text(), age: float() }) // { name: 'John, age: 0 }
```

- The `def` parameter indicates the value to return when the 'fixer' cannot fix the incoming data or the data is `null` or `undefined`. For example:

```js
fix(null, text()) // ''
fix(undefined, text({ def: 'aaa' })) // 'aaa'
fix({}, float({ def: 100 })) // 100, since {} cannot be fixed
```

- The `coerce` parameter indicates that you want to "force" the conversion (default is `true`). For example:

```js
fix(100, text()) // '100'
fix(100, text({ coerce: false })) // '', since 100 is not a string
```

- The `required` parameter indicates that an incoming value is required. For example:

```js
fix(undefined, float()) // 0, as we expect a number
fix(null, float({ required: false })) // undefined
fix(undefined, text({ required: false })) // undefined
```

> [!NOTE]
> You'll probably never have to use `required`, `def` or `coerce`. But they're there!
> 
> Take a look at the [TEST FILE](./src/index.test.ts) for more examples.

## Combine fixers

You can apply different "fixers" to the same incoming data by combining them. For example:

```js
fix('Hello!', [text(), upper()]) // 'HELLO!'
```

## Create your own fixer

This is a simple fixer:

```ts
import sf from '@gchumillas/schema-fixer'

// fixes a color
const colorFixer = sf.createFixer('#000000', (value) => {
  const color = `${value}`.trim().toUpperCase()

  if (color.match(/^#([0-9,A-F]{6})$/)) {
    // nice!
    return color
  } else {
    const matches = color.match(/^#([0-9,A-F]{3})$/)

    if (matches) {
      return `#${matches[1].split('').map(d => d.repeat(2)).join('')}`
    }
  }

  // a default value is provided
  throw new TypeError('not a color')
})

sf.fix('#f6f', colorFixer())    // '#FF66FF'
sf.fix('#f6ef6f', colorFixer()) // '#F6EF6F'
sf.fix('red', colorFixer())     // '#000000', as 'red' is not a color
```

## Contributing

Do you want to contribute? Fantastic! You can start with [THIS ISSUE](https://github.com/gchumillas/schema-fixer/issues/10) or help me find bugs.
