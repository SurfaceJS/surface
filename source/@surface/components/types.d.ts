import { Func1, KeyValue } from "@surface/core";
export type AttributeParse<T, M extends Record<string, keyof T>> = { [K in keyof M]: M[K] extends keyof T ? Func1<string, T[M[K]]> : never };
export type AttributeConverter<T, K extends keyof T> = { [P in K]: (value: string) => T[P] };
export type PropertyStringfy<T, K extends keyof T>   = { [P in K]: (value: T[P]) => string };