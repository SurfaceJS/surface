/* eslint-disable @typescript-eslint/no-explicit-any */
export type Factory<A extends any[], T>  = (...args: A) => T;
export type FunctionType                 = (...args: any[]) => any;
export type Method<T, K extends keyof T> = T[K] extends FunctionType ? T[K] : never;