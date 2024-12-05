type Prettify<T> = { [K in keyof T]: T[K] } & {}

export type Fixer<S = unknown> = (value: any) => S
export type FixerRecord = Record<string, Fixer>
export type Schema = Fixer | FixerRecord

export type Value<T> = T extends FixerRecord
  ? { [Prop in keyof T]: ReturnType<T[Prop]> } & {}
  : T extends Fixer
  ? ReturnType<T>
  : never

// main functions
export function fix<T extends Schema>(value: any, schema: T): Value<T>

// create custom parsers
declare function parser<T, S>(
  options: Prettify<{ required: false; default?: undefined } & S>
): (value: any) => T | undefined
declare function parser<T, S>(options?: Prettify<{ required?: boolean; default?: T } & S>): (value: any) => T
declare function createParser<T, S extends Record<string, any>>(
  fn: (value: any, options: S) => T,
  // TODO: default should be required
  options?: { default?: T }
): typeof parser<T, S>

// utilities
export function schema<T extends Schema>(schema: T): (value: any) => Value<T>
export function join<T>(...fixers: Fixer<T>[]): Fixer<T>

// parsers
export const string: ReturnType<typeof createParser<string, { coerced?: boolean }>>
export const number: ReturnType<typeof createParser<number, { coerced?: boolean }>>
export const boolean: ReturnType<typeof createParser<boolean, { coerced?: boolean }>>
export const trim: ReturnType<typeof createParser<string, {}>>
export const lower: ReturnType<typeof createParser<string, {}>>
export const upper: ReturnType<typeof createParser<string, {}>>

export function array<T extends Schema>(_: {
  required: false
  default?: undefined
  of: T
}): (value: any) => Array<Value<T>> | undefined
export function array<T extends Schema>(_: {
  required?: boolean
  default?: Array<Value<T>>
  of: T
}): (value: any) => Array<Value<T>>
