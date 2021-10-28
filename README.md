A library to "fix" external data.

## Motivation

When working with external data, be it data from databases or forms, it's common that it's not presented in the proper format. And it can lead to serious problems, such as [Code Injection](https://en.wikipedia.org/wiki/Code_injection) or [Data Corruption](https://en.wikipedia.org/wiki/Data_corruption).

This library "fixes" the data so that it can be rendered or processed properly. It is especially suitable when working with APIs or NoSQL databases. Here are some features:

1. Avoid `null` and `undefined` values. Those values are replaced by "default values", so that the front-end developers don't have to worry about to recheck the data to prevent "null/undefined errors".
2. Remove undesired extra-properties. This way we can prevent Code Injection.
3. Coercion. Transform numbers, booleans, etc. to the correct types to prevent Data Corruption.
