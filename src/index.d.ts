type Prettify<T> = { [K in keyof T]: T[K] } & {}

export type Fixer<S = unknown> = (value: any) => S
interface SchemaRecord extends Record<string, Schema> {}
export type Schema = Fixer | Fixer[] | SchemaRecord

export type Value<T extends Schema> =
  T extends Fixer ? ReturnType<T> :
  T extends Fixer[] ? ReturnType<T[0]> :
  T extends Record<string, Schema> ? { [Prop in keyof T]: Value<T[Prop]> } & {} :
  never

// main functions
export function fix<T extends Schema>(value: any, schema: T): Value<T>

// create custom fixers
declare function fixer<T, S>(options: Prettify<{ required: false } & S>): (value: any) => T | undefined
declare function fixer<T, S>(options?: Prettify<{ def?: T } & S>): (value: any) => T
declare function createFixer<T, S extends Record<string, any>>(
  def: T,
  fn: (value: any, options: S) => T
): typeof fixer<T, S>

// fixers
export const text: ReturnType<typeof createFixer<string, { coerce?: boolean }>>
export const float: ReturnType<typeof createFixer<number, { coerce?: boolean }>>
export const bool: ReturnType<typeof createFixer<boolean, { coerce?: boolean }>>
export const trim: ReturnType<typeof createFixer<string, {}>>
export const lower: ReturnType<typeof createFixer<string, {}>>
export const upper: ReturnType<typeof createFixer<string, {}>>

export function list<T extends Schema>(_: { required: false; of: T }): (value: any) => Array<Value<T>> | undefined
export function list<T extends Schema>(_: { def?: Array<Value<T>>; of: T }): (value: any) => Array<Value<T>>
