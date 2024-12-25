# Schema-Fixer

**What is Schema-Fixer?**

Schema-Fixer is a lightweight utility designed to sanitize data while preserving its types.

**What is it not?**

Schema-Fixer is not a transformer or a validator—it doesn't validate correctness or enforce structure. It simply "fixes" data to align with a given schema.

**Why use Schema-Fixer?**

Handling `null`, `undefined`, or unexpected data formats can lead to application crashes or unintended behavior. Schema-Fixer ensures that your data conforms to the expected schema, allowing your application to run smoothly without errors caused by malformed input.

## Key Features

- **Reliable and Fail-Safe**<br> Schema-Fixer can process any data against a given schema without failing.
  
- **Type Inference**<br> Automatically infers data types based on the provided schema.

- **Graceful Handling of `null` and `undefined`**<br> Replaces `null` or `undefined` values with predefined default values, ensuring data integrity
  
- **Prevents Unwanted Properties**<br> Excludes extraneous or unexpected properties, mitigating risks like code injection.

## Install

```bash
# install from your project directory
npm install @gchumillas/schema-fixer
```

```js
// and import it from your file.js or file.ts
import sf from '@gchumillas/schema-fixer'

console.log(sf.fix(100, 'string')) // returns '100'
```

## Example

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
    children: sf.list({ of: sf.text() }),
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

## Sugar syntax

For brevity, you can also use the "sugar syntax", which replaces "aliases" with the corresponding fixers:

```js
import sf from '@gchumillas/schema-fixer'

const fixedData = sf.fix(data, {
  name: 'string',       // sf.text()
  age: 'number',        // sf.float()
  isMarried: 'boolean', // sf.bool()
  children: 'string[]', // sf.list({ of: sf.text() })
  years: 'number[]',    // sf.list({ of: sf.float() })
  items: 'boolean[]'    // sf.list({ of: sf.bool() })
})
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
floor({ def = 0, required = true })                    // math floor
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
sf.fix('red', colorFixer())     // '#000000', as 'red' is not a valid color
```

## Contributing

Do you want to contribute? Fantastic! Take a look at [open issues](https://github.com/gchumillas/schema-fixer/issues) or help me find and fix bugs.
