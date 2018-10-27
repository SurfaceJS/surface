import { Func1, KeyValue, MappedIndexer } from "@surface/core";
export type AttributeParse<T, M extends MappedIndexer<string, keyof T>> = { [K in keyof M]: M[K] extends keyof T ? Func1<string, T[M[K]]> : never };
export type PropertyStringfy<T, K extends keyof T> = { [P in K]: (value: T[P]) => string };