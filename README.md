Schema-Fixer is just a small library for "repairing" data from external sources with **full TypeScript support**.

> Don't let your application break just because the server doesn't return data in the proper format.

> No more undefined errors!

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
        // we can combine multiple 'pipes'
        id: sf.join(sf.string(), sf.upper())
      }
    })
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

```
// main functions
fix(data, schema)     - repairs the data against a schema
parse(data, schema)   - repairs the data againts a schema and return the errors

// utilities
schema(schema)        - allows nested schemas
join(fixers[])        - combines multiple "fixers"

// fixers
string()              - fixes a string
number()              - fixes a number
boolean()             - fixes a boolean
array({ of: schema }) - fixes an array
trim()                - removes whitespaces
lower()               - converts text to lowercase
upper()               - converts text to uppercase
```

## Need more examples?

Take a look at the [TESTS FILE](./src/index.test.js).
