export type Result<T> = [value: T] | [value: undefined, error: any]
export function error<T>(value: T): [undefined, T]
export function ok<T>(value: T): [T]

export type Pipe<T, S> = (value: any, options: T & { require: boolean, default: any, path: string }) => Result<S>
export type PipeFactory<T, S> = (options?: T & { require?: boolean, default?: any }) => Pipe<T, S>
export function pipe<T = {}, S = any>(fn: Pipe<T, S>, options?: { default: S }): PipeFactory<T, S>;

interface SchemaRecord extends Record<string, Schema> { }
export type Schema = (string | Pipe<any, any>) | (string | Pipe<any, any>)[] | SchemaRecord;
export function fix(value: any, schema: Schema): any;
export function parse(value: any, schema: Schema, options?: { path?: string }): [value: any, errors: any[]];
