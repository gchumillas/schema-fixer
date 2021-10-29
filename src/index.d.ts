type Pipe = string | ((value: any) => any);
interface SchemaRecord extends Record<string, Schema> { }
export type Schema = Pipe | Pipe[] | SchemaRecord;
export function fix(value: any, schema: Schema): any;
export function parse(value: any, schema: Schema): [value: any, errors: any[]];
export function pipe(fn: (value: any) => any, options?: Record<string, any>)
export function error<T>(value: T): [undefined, T]
export function ok<T>(value: T): [T]
