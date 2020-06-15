export type FunctionType                     = (...args: Array<any>) => any;
export type Method<T, K extends keyof T>     = T[K] extends FunctionType ? T[K] : never;
export type Factory<A extends Array<any>, T> = (...args: A) => T;