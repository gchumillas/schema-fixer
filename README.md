# Schema-Fixer

A small library to fix external data sources with full TypeScript support.

Working with external data sources is always a risk as they may be rendered in a wrong format and cause your application to crash. The main goal of this library is "to fix" those external data sources.

### `undefined` and `null` are harmful values

The values `undefined` and `null` are considered "harmful" and they are converted to "default values". For example:

```ts
import sf from '@gchumillas/schema-fixer'

sf.fix(undefined, sf.string())              // returns ""
sf.fix(null, sf.number())                   // returns 0
sf.fix(null, sf.boolean({ default: true })) // returns true
```

### Use in combination with Axios (a typical example)

The following code shows a typical example of using "schema-fixer" in combination with Axios to "repair" data coming from the server:

```ts
import sf from '@gchumillas/schema-fixer'

function getAuthor = async (authorId: string) => {
  const res = await axios.get(`/api/authors/${authorId}`)

  // 'repairs' the data and ensure it is returned as expected
  return sf.fix(res.data, {
    name: sf.string(),
    middleName: sf.string(),
    lastName: sf.string(),
    age: sf.number(),
    isMarried: sf.boolean(),
    childrend: sf.array({ of: sf.string() }),
    // nested schema
    address: sf.schema({
      street: sf.string(),
      city: sf.string(),
      state: sf.string()
    }),
    // array of complex objects
    books: sf.array({
      of: {
        title: sf.string(),
        year: sf.number(),
        // combine multiple 'fixers'
        id: sf.join(sf.trim(), sf.upper())
      }
    })
  })
}
```

### Not all data can be fixed

It's important to note that **not all data can be fixed**. In those cases the `fix` function throws an error. For example:

```ts
import sf from '@gchumillas/schema-fixer'

fix({ text: "I'm not a string" }, string())      // throws an error
fix("I'm not a number", number())                // throws an error
fix("I'm not an array", array({ of: string() })) // throws an error
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

```
// main functions
fix(data, schema)      - repairs the data against a schema
parse(data, schema)    - repairs the data againts a schema and return the errors

// create parsers
createParser(fn, opts) - create a custom parser

// utilities
schema(schema)         - allows nested schemas
join(fixers[])         - combines multiple "fixers"

// fixers
string()               - fixes a string
number()               - fixes a number
boolean()              - fixes a boolean
array({ of: schema })  - fixes an array
trim()                 - removes whitespaces
lower()                - converts text to lowercase
upper()                - converts text to uppercase
```

## Basic examples

```js
// no more `undefined` or `null` values
fix(undefined, string())           // => ''
fix(null, number())                // => 0
fix(undefined, boolean())          // => false
fix(null, array({ of: string() })) // => []

// replaces "empty values" with default values
fix('', string({ default: 'John Smith' })) // => 'John Smith'
fix('', number({ default: 100 }))          // => 100
fix(undefined, boolean({ default: true })) // => true

fix({}, {
  name: string({ default: 'John' }),
  surname: string({ default: 'Smith' })
}) // => { name: 'John', surname: 'Smith' }
```

**>> Need more examples?**

Take a look at the [TESTS FILE](./src/index.test.js).

## Write your own "parsers"

```ts
import sf from '@gchumillas/schema-fixer'

// tries to fix a "human date" to ensure it is returned in ISO format
const date = sf.createParser((value: any) => {
  const milliseconds = Date.parse(`${value}`)

  if (isNaN(milliseconds)) {
    throw new Error('not a date')
  }

  const date = new Date(milliseconds)
  return date.toISOString()
})

// Examples
fix('1 Feb 2022', date())       // => '2022-02-01T00:00:00.000Z'
fix('2012-07-15', date())       // => '2012-07-15T00:00:00.000Z'
fix('2023-08-03 15:48', date()) // => '2023-08-03T14:48:00.000Z'
fix('1/1/1', date())            // => throws an error!
```

## Compared with Zod

Keep in mind that this library was designed to **simplify the process of "fixing" data**, rather than validating it against a given schema. For other uses Zod may offer better features.
