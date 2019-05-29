import { Func1, KeyValue } from "@surface/core";
export type AttributeConverter<T, K extends keyof T> = { [P in K]: (value: string) => T[P] };