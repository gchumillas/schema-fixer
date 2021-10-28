A library to "fix" external data.

## Motivation

When working with external data, be it data from databases or forms, it's common that it's not presented in the proper format. And it can lead to serious problems, such as [Code Injection](https://en.wikipedia.org/wiki/Code_injection) or [Data Corruption](https://en.wikipedia.org/wiki/Data_corruption).

This library "fixes" the data so that it can be rendered or processed properly. It is especially suitable when working with APIs or NoSQL databases. Here are some features:

1. Avoid `null` and `undefined` values. Those values are replaced by "default values", so that the front-end developers don't have to worry about to recheck the data to prevent "null/undefined errors".
2. Remove undesired extra-properties. This way we can prevent Code Injection.
3. Coercion. Transform numbers, booleans, etc. to the correct types to prevent Data Corruption.

## Example (the long way)

```js
import { fix } from '@gchumillas/schema-fixer'
import { string, number, boolean, array, upper } from '@gchumillas/schema-fixer/pipes'

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
  name: [string()],
  middleName: [string()],
  lastName: [string()],
  age: [number()],
  isMarried: [boolean()],
  childrend: [array({ type: [string()] })],
  books: [array({
    type: { // type can be a complex schema
      title: [string()],
      year: [number()],
      id: [string(), upper()] // we can apply two `pipes`
    }
  })]
})

console.log(fixedData)
```

The previous script outputs:
```
{
  name: 'Stephen',
  middleName: '',   // undefined has been replaced by  ''
  lastName: 'King',
  age: 74,          // '74' has been replaced by 74
  isMarried: true,  // 1 has been replaced by true
  childrend: [ 'Joe Hill', 'Owen King', 'Naomi King' ],
  books: [
    { title: 'The Stand', year: 1978, id: 'ISBN-9781444720730' },
    { title: "Salem's lot", year: 1975, id: 'ISBN-0385007515' }
  ]
  // metadata was ignored
}
```

## Example (the short way)

The previous code can be written in the following "short way":
```js
const fixedData = fix(data, {
  name: 'string',  // omit the array, as there's only one pipe
  middleName: 'string',
  lastName: 'string',
  age: 'number',
  isMarried: 'boolean',
  childrend: 'string[]', // shorthand for array({ type: 'string' })
  books: [array({
    type: {
      title: 'string',
      year: 'number',
      id: ['string', 'upper'] // these two pipes are applied in order
    }
  })]
})
```

## Custom pipes

Creating new pipes is extremely simple. For example:

```js
import { fix, pipe, error, ok } from '@gchumillas/schema-fixer'

const floor = pipe(value => {
  if (typeof value != 'number') {
    return error('not a number')
  }

  return Math.floor(value)
})

// note that you can pass "scalar" values to the fix function
const data = fix('105.48', ['number', floor()])
console.log(data) // returns 105
```

## Need more examples?

Take a look at the [TEST FILE](./src/index.test.js).

## Author notes

This library is still in beta and shouldn't be used in production.
