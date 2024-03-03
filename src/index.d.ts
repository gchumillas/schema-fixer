export type Result<T> = [value: T] | [value: undefined, error: any]

export type Pipe<T, S> = (value: any, options: T & { required: boolean, default: any, path: string }) => Result<S>
export type PipeFactory<T, S> = (options?: T & { required?: boolean, default?: any }) => Pipe<T, S>
export function pipe<T = {}, S = any>(fn: Pipe<T, S>, options?: { default: S }): PipeFactory<T, S>

interface SchemaRecord extends Record<string, Schema> { }
export type Schema = Pipe<any, any> | Pipe<any, any>[] | SchemaRecord
export function fix(value: any, schema: Schema): any
export function parse(value: any, schema: Schema, options?: { path?: string }): [value: any, errors: any[]]

export const pipes: {
  string: PipeFactory<{ coerced?: boolean }, string>
  number: PipeFactory<{ coerced?: boolean }, number>
  boolean: PipeFactory<{ coerced?: boolean }, boolean>
  date: PipeFactory<{}, string>
  array: PipeFactory<{ of: Schema }, any[]>
  included: PipeFactory<{ in: string[] }, string>
  trim: PipeFactory<{}, string>
  lower: PipeFactory<{}, string>
  upper: PipeFactory<{}, string>
}
