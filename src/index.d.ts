type Prettify<T> = { [K in keyof T]: T[K] } & {}

export type FixerAlias = 'string' | 'number' | 'boolean' | 'string[]' | 'number[]' | 'boolean[]'
export type Fixer<S = unknown> = (value: any) => S

interface SchemaRecord extends Record<string, Schema> {}
export type Schema = FixerAlias | Fixer | Fixer[] | SchemaRecord

export type FixerAliasType<T extends FixerAlias> = 
  T extends 'string' ? string :
  T extends 'number' ? number :
  T extends 'boolean' ? boolean :
  T extends 'string[]' ? string[] :
  T extends 'number[]' ? number[] :
  T extends 'boolean[]' ? boolean[] :
  never
export type SchemaType<T extends Schema> =
  T extends FixerAlias ? FixerAliasType<T> :
  T extends Fixer<infer S> ? S :
  T extends Fixer<infer S>[] ? S :
  T extends Record<string, Schema> ? { [Prop in keyof T]: SchemaType<T[Prop]> } & {} :
  never

// main functions
export function fix<T extends Schema>(value: any, schema: T): SchemaType<T>

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

export function list<T extends Schema>(_: { required: false; of: T }): (value: any) => Array<SchemaType<T>> | undefined
export function list<T extends Schema>(_: { def?: Array<SchemaType<T>>; of: T }): (value: any) => Array<SchemaType<T>>
