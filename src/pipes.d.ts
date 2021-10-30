import { Schema, PipeFactory } from ".";

export const string: PipeFactory<{ coerce?: boolean }, string>
export const number: PipeFactory<{ coerce?: boolean }, number>
export const boolean: PipeFactory<{ coerce?: boolean }, boolean>
export const array: PipeFactory<{ type: Schema }, any[]>
export const select: PipeFactory<{ options: string[] }, string>
export const trim: PipeFactory<{}, string>
export const lower: PipeFactory<{}, string>
export const upper: PipeFactory<{}, string>
