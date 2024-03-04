export type Fixer = (value: any) => unknown
export type FixerRecord = Record<string, Fixer>
export type Schema = Fixer | FixerRecord

export type Value<T> = T extends FixerRecord
  ? { [Prop in keyof T]: ReturnType<T[Prop]> } & {}
  : T extends Fixer
  ? ReturnType<T>
  : never

export function fix<T extends Schema>(schema: T): Value<T>
export function fix<T extends Fixer[]>(schema: [...T]): { [Prop in keyof T]: ReturnType<T[Prop]> } & {}

export const pipes: {
  string: (_?: { default?: string; required?: boolean; coerced?: boolean }) => (value: any) => string
  number: (_?: { default?: number; required?: boolean; coerced?: boolean }) => (value: any) => number
  boolean: (_?: { default?: boolean; required?: boolean; coerced?: boolean }) => (value: any) => boolean
  array: <T extends Schema>(_: {
    default?: Array<Value<T>>
    required?: boolean
    of: T
  }) => (value: any) => Array<Value<T>>
  trim: () => (value: any) => string
  lower: () => (value: any) => string
  upper: () => (value: any) => string
}
