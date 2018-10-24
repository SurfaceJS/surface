export interface Constructor<T = Object> extends Function
{
    new (...args: Array<any>): T;
    readonly prototype: T;
}

export type Action                                         = () => void;
export type Action1<T1>                                    = (arg: T1) => void;
export type Action2<T1, T2>                                = (arg1: T1, arg2: T2) => void;
export type Action3<T1, T2, T3>                            = (arg1: T1, arg2: T2, arg3: T3) => void;
export type ArgumentsOf<T extends Function>                = T extends (...args: infer TArgs) => any ? TArgs : never;
export type ClassDecoratorOf<T>                            = (target: Constructor<T>) => Constructor<T> | void;
export type DeepRequired<T>                                = { [K in keyof T]-?: T[K] extends T[K]|undefined ? DeepRequired<T[K]> : Required<T[K]> };
export type FieldsOf<T>                                    = { [K in keyof T]: T[K] };
export type Func<TResult>                                  = () => TResult;
export type Func1<T1, TResult>                             = (arg: T1) => TResult;
export type Func2<T1, T2, TResult>                         = (arg1: T1, arg2: T2) => TResult;
export type Func3<T1, T2, T3, TResult>                     = (arg1: T1, arg2: T2, arg3: T3) => TResult;
export type KeyValue<T, K extends keyof T = keyof T>       = [K, T[K]];
export type IgnoreKeysOfType<T extends object, U>          = { [K in keyof T]: T[K] extends U ? never : K }[keyof T];
export type IgnoreOfType<T extends object, U>              = { [K in IgnoreKeysOfType<T, U>]: T[K] };
export type KeysOfType<T extends object, U>                = { [K in keyof T]: T[K] extends U ? K : never }[keyof T];
export type MappedIndex<K extends string|number|symbol, T> = { [P in K]: T };
export type MethodsOf<T extends object>                    = KeysOfType<T, Function>;
export type Nullable<T = Object>                           = T|null|undefined;
export type ObjectLiteral<T = unknown>                     = { [key: string]: T; [key: number]: T; };
export type Omit<T, U extends keyof T>                     = { [K in Exclude<keyof T, U>]: T[K] };
export type OnlyOfType<T extends object, U>                = Pick<T, KeysOfType<T, U>>;
export type Overwrite<T, U>                                = { [K in Exclude<keyof T, U>]: K extends keyof U ? U[K] : T[K] }; 
export type Required<T>                                    = { [K in keyof T]-?: NonNullable<T[K]> };
export type ReturnOf<T extends Function>                   = T extends (...args: Array<any>) => infer TReturn ? TReturn extends void ? undefined : TReturn : never;
export type TypesOf<T>                                     = { [K in keyof T]: T[K] }[keyof T];