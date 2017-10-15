export interface Constructor<T> extends Function
{
    new (...args: Array<any>): T;
    Symbols:   any;
    prototype: T;
}

export type Action1<T1>                = (arg: T1) => void;
export type Action2<T1, T2>            = (arg1: T1, arg2: T2) => void;
export type Action3<T1, T2, T3>        = (arg1: T1, arg2: T2, arg3: T3) => void;
export type ClassDecoratorOf<T>        = (target: Constructor<T>) => Constructor<T> | void;
export type Func<TResult>              = () => TResult;
export type Func1<T1, TResult>         = (arg: T1) => TResult;
export type Func2<T1, T2, TResult>     = (arg1: T1, arg2: T2) => TResult;
export type Func3<T1, T2, T3, TResult> = (arg1: T1, arg2: T2, arg3: T3) => TResult;
export type Action                     = () => void;
export type Nullable<T>                = T|null|undefined;
export type LiteralObject<T = any>     = { [key: string]: T }