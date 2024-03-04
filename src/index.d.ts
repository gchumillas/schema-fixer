export type Fixer = (value: any) => unknown
export type FixerRecord = Record<string, Fixer>
export type Schema = Fixer | FixerRecord

export type Value<T> = T extends FixerRecord
  ? { [Prop in keyof T]: ReturnType<T[Prop]> } & {}
  : T extends Fixer
  ? ReturnType<T>
  : never

export function fix<T extends Schema>(value: any, schema: T): Value<T>
export function parse<T extends Schema>(value: any, schema: T): [Value<T>, errors: any[]]

// fixers
export function schema<T extends Schema>(schema: T): (value: any) => Value<T>
export function string(_?: { default?: string; required?: boolean; coerced?: boolean }): (value: any) => string
export function number(_?: { default?: number; required?: boolean; coerced?: boolean }): (value: any) => number
export function boolean(_?: { default?: boolean; required?: boolean; coerced?: boolean }): (value: any) => boolean
export function array<T extends Schema>(_: {
  default?: Array<Value<T>>
  required?: boolean
  of: T
}): (value: any) => Array<Value<T>>
export function trim(): (value: any) => string
export function lower(): (value: any) => string
export function upper(): (value: any) => string
