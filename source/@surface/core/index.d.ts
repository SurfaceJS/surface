export interface Constructor<T = Object> extends Function
{
    new (...args: Array<any>): T;
    readonly prototype: T;
}

export type Action                                   = () => void;
export type Action1<T1>                              = (arg: T1) => void;
export type Action2<T1, T2>                          = (arg1: T1, arg2: T2) => void;
export type Action3<T1, T2, T3>                      = (arg1: T1, arg2: T2, arg3: T3) => void;
export type ClassDecoratorOf<T>                      = (target: Constructor<T>) => Constructor<T> | void;
export type DeepRequired<T>                          = { [K in keyof T]-?: T[K] extends T[K]|undefined ? DeepRequired<T[K]> : Required<T[K]> };
export type FieldsOf<T>                              = { [K in keyof T]: T[K] };
export type Func<TResult>                            = () => TResult;
export type Func1<T1, TResult>                       = (arg: T1) => TResult;
export type Func2<T1, T2, TResult>                   = (arg1: T1, arg2: T2) => TResult;
export type Func3<T1, T2, T3, TResult>               = (arg1: T1, arg2: T2, arg3: T3) => TResult;
export type Nullable<T>                              = T|null|undefined;
export type ObjectLiteral<T = Object|null|undefined> = { [key: string]: T };
export type Omit<T, U extends keyof T>               = { [K in Exclude<keyof T, U>]: T[K] };
export type Overwrite<T, U>                          = { [K in Exclude<keyof T, U>]: K extends keyof U ? U[K] : T[K] }; 
export type Required<T>                              = { [K in keyof T]-?: NonNullable<T[K]> };
export type TypesOf<T>                               = { [K in keyof T]: T[K] }[keyof T];
export type Unknown                                  = Object|null|undefined;