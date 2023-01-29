A library to "fix" external data.

## Motivation

When working with external data, be it data from databases or forms, it's common that it's not presented in the proper format. And it can lead to serious problems, such as [Code Injection](https://en.wikipedia.org/wiki/Code_injection) or [Data Corruption](https://en.wikipedia.org/wiki/Data_corruption).

This library "fixes" the data so that it can be rendered or processed properly. It is especially suitable when working with APIs or NoSQL databases. Here are some features:

1. Avoid `null` and `undefined` values. Those values are replaced by "default values", so that the front-end developers don't have to worry about to recheck the data to prevent "null/undefined errors".
2. Remove undesired extra-properties. This way we can prevent Code Injection.
3. Coercion. Transform numbers, booleans, etc. to the correct types to prevent Data Corruption.

## Install

Just run the following command inside the project's folder:

```bash
yarn add @gchumillas/schema-fixer
```

## Example

```js
import { fix, pipes } from '@gchumillas/schema-fixer'
const { string, number, boolean, array, upper } = pipes

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
  // this property was accidentally passed and
  // will be removed from the fixed data
  metadata: 'console.log(\'please ignore me\')'
}

const schema = {
  name: string(),
  middleName: string(),
  lastName: string(),
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
}

// fix the data against the schema
const fixedData = fix(data, schema)
console.log(fixedData)
```

The previous code outputs:
```js
{
  name: 'Stephen',
  middleName: '',   // Undefined has been replaced by  ''.
  lastName: 'King',
  age: 74,          // '74' has been replaced by 74.
  isMarried: true,  // 1 has been replaced by true.
  childrend: [ 'Joe Hill', 'Owen King', 'Naomi King' ],
  books: [
    { title: 'The Stand', year: 1978, id: 'ISBN-9781444720730' },
    { title: 'Salem\'s lot', year: 1975, id: 'ISBN-0385007515' }
  ]
  // the "metadata" property was removed from the result
  // as it wasn't part of the schema
}
```

**Definitions:**

- A `pipe` is any function used to "validate" and "fix" the data. This library
  already contains some predefined pipes: `string`, `number`, `boolean`, `array`,
  `select`, `trim`, `lower` and `upper`. **However you can write your own pipes**.
- A `schema` is any combination of `pipes`. The following examples are schemas:
  ```js
  const schema1 = string()
  const schema2 = [string(), upper()]
  const schema3 = { title: string(), year: number(), id: [string(), upper()] }
  ```
  The data is "validated" and "fixed" against the schemas.

## Custom pipes

Creating new pipes is pretty simple. For example:

```js
import { pipes, fix, pipe, error, ok } from '@gchumillas/schema-fixer'
const { number } = pipes

const floorPipe = pipe((value) => {
  if (typeof value != 'number') {
    return error('not a number')
  }

  return ok(Math.floor(value))
})

// Note that you can pass "scalar" values to the fix function.
const data = fix('105.48', [number(), floorPipe()])
console.log(data) // outputs: 105
```

Another example:
```js
import { pipes, fix, pipe, ok, error } from '@gchumillas/schema-fixer'
const { string, upper, trim } = pipes

const colorPipe = pipe((value) => {
  if (typeof value != 'string' || !value.match(/^\#[0-9A-F]{6}$/i)) {
    return error('not a color')
  }

  return ok(value)
})

// note that we are using multiple pipes before applying our custom pipe
const fixedColor = fix('#ab783F', [string(), upper(), trim(), colorPipe()])
console.log(fixedColor) // outputs: #AB783F
```

## Combining multiple pipes

You can apply multiple pipes to the same data. For example
```js
const color = '  #aB4cf7  '
const fixedColor = fix(color, [string(), trim(), upper()])
console.log(fixedColor) // outputs: #AB4CF7
```

## fix vs. parse

The `parse` function, unlike the `fix` function, doesn't throw any exceptions.
Instead, it returns an array of errors that can be inspected later. For example:

```js
// May throw an exception if "data" does not satisfy the "schema".
try {
  const fixedData = fix(data, schema)
} catch (reason) {
  console.log(reason)
}

// The "parse" function never fails.
// Instead it returns a list of errors.
const [fixedData, errors] = parse(data, schema)
if (errors.length > 0) {
  console.log(errors)
}
```

## Predefined pipes

This library includes the following predefined pipes:

```js
function string({
  default = '',
  // When possible tries to convert the value into a string,
  // otherwise it throws an exception.
  coerced = true,
  // Throws an exception if value is '', null or undefined.
  // The 'default' parameter is ignored when [required = true]
  required = false
}) {}

fix('hello there!', string())              // returns 'hello there!'
fix(true, string())                        // returns 'true' (string)
fix('', string({ default: 'John Smith' })) // returns 'John Smith'
fix(undefined, string({ required: true })) // throws 'required'
fix(125.48, string({ coerced: false }))    // throws 'not a string'
fix({ id: 101 }, string())                 // throws 'not a string'
```

```js
function number({
  default = 0,
  // When possible tries to convert the value into a number,
  // otherwise it throws an exception.
  coerced = true,
  // Throws an exception if value is null or undefined.
  // The 'default' parameter is ignored when [required = true]
  required = false
}) {}

fix(125.48, number())                  // returns 125.48
fix('125.48', number())                // returns 125.48
fix(undefined, number())               // returns 0
fix(null, number({ default: 125.48 })) // returns 125.48
fix(null, number({ required: true }))  // throws 'required'
fix('lorem ipsum', number())           // throws 'not a number'
```

```js
function boolean({
  default: false,
  // When possible tries to convert the value into a number,
  // otherwise it throws an exception.
  coerced = true,
}) {}

fix(true, boolean())                        // returns true
fix(1, boolean())                           // returns true
fix('', boolean())                          // returns false
fix('lorem ipsum', boolean())               // returns true
fix({}, boolean())                          // returns true
fix(undefined, boolean())                   // returns false
fix(undefined, boolean({ default: true }))  // returns true
fix(undefined, boolean({ required: true })) // throws 'required'
fix(1, boolean({ coerced: false }))         // throws 'not a boolean'
```

```js
function array({
  of: pipe | pipes[] | schema,
  default: []
}) {}

fix([true, false], array({ of: string() }))                 // returns ['true', 'false']
fix([0, 1], array({ of: boolean() }))                       // returns [false, true]
fix([1, '2', 3], array({ of: number() }))                   // returns [1, 2, 3]
fix(undefined, array({ of: string() }))                     // returns []
fix(undefined, array({ of: number(), default: [1, 2, 3] })) // returns [1, 2, 3]
fix(undefined, array({ of: number(), required: true }))     // throws 'required'
```

```js
included({ in: string[] })

fix('sold', included({ in: ['sold', 'available']}))              // returns 'sold'
fix('hello, John', included({ in: ['bye bye', 'hello, John'] })) // returns 'hello, John'
fix(101, included({ in: ['101', '102']}))                        // throws 'not a string'
```

```js
function trim() {}
function lower() {}
function upper() {}

fix(' hello there! ', trim()) // returns 'hello there!'
fix('Hello There!', lower())  // returns 'hello there!'
fix('hello there!', upper())  // returns 'HELLO THERE!'
```

## Need more examples?

Take a look at the [PIPES FILE](./src/pipes.js) and the [TEST FILE](./src/index.test.js).
