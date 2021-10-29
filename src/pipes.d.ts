import { Schema } from ".";

export function string(options?: { require?: boolean, default?: any, coerce?: boolean }): (value: any) => string;
export function number(options?: { require?: boolean, default?: any, coerce?: boolean }): (value: any) => number;
export function boolean(options?: { require?: boolean, default?: any, coerce?: boolean }): (value: any) => boolean;
export function array(options: { require?: boolean, default?: any, type: Schema }): (value: any) => any[];
export function select(options: { options: string[] }): (value: any) => string;
export function trim(): (value: any) => string;
export function lower(): (value: any) => string;
export function upper(): (value: any) => string;
