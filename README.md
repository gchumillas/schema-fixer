Just a small library for "repairing" data from external sources with **full TypeScript support**.

> Don't let your application break just because the server doesn't return data in the proper format.
> 
> No more `undefined` errors!

**Preliminary notes:**

- **The values `null` and `undefined` are considered harmful** and will be converted to the desired value types. For example `fix(undefined, string())` returns `""` and `fix(null, number())` returns `0`.

- **Values are converted by default**. For example `fix(100, string())` returns `"100"` and `fix("100", number())` returns `100`. However `fix(100, string({ coerced: false }))` throws an error.

See more examples in the [Basic examples](#basic-examples) section.

```ts
// In the next example the `fix` function tries to "repair" the data against an schema,
// which consists of any combination of "fixers".
//
// You can also create your own "fixers".

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

## Write your own "fixers"

```ts
import sf from '@gchumillas/schema-fixer'

// tries to fix a "human date" to ensure it is returned in ISO format
const date = () => (value: any) => {
  const milliseconds = Date.parse(`${value}`)

  if (isNaN(milliseconds)) {
    throw new Error('not a date')
  }

  const date = new Date(milliseconds)
  return date.toISOString()
}

// Examples
fix('1 Feb 2022', date())       // => '2022-02-01T00:00:00.000Z'
fix('2012-07-15', date())       // => '2012-07-15T00:00:00.000Z'
fix('2023-08-03 15:48', date()) // => '2023-08-03T14:48:00.000Z'
fix('1/1/1', date())            // => throws an error!
```

## Alternatives

The goal of this library is to fix the most common problems quickly and comfortably. For more advanced cases I recommend using the [Zod](https://github.com/colinhacks/zod) library.

Here are some differences:

```ts
import { z } from "zod";
import sf from "@gchumillas/schema-fixer";

// Zod
const ZodAuthor = z.object({
  name: z.coerce.string().min(1),
  surname: z.coerce.string().default(""),
  age: z.coerce.number().default(0)
});

// Schema Fixer
//
// values are converted by default (no need for "coerce")
// empty values are converted by default (no need for "default")
const SchemaFixerAuthor = sf.schema({
  name: sf.string({ required: true }),
  surname: sf.string(),
  age: sf.number()
});
```