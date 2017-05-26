declare module '*.txt'
{
    var _: string;
    export default  _;
}

declare module '*.json'
{
    var _: string;
    export default  _;
}

declare module '*.html'
{
    var _: string;
    export default  _;
}

declare module '*.scss'
{
    var _: string;
    export default  _;
}

declare module '*.sass'
{
    var _: string;
    export default  _;
}

declare module '*.css'
{
    var _: string;
    export default  _;
}

declare type Func<TResult>              = () => TResult;
declare type Func1<T1, TResult>         = (arg: T1) => TResult;
declare type Func2<T1, T2, TResult>     = (arg1: T1, arg2: T2) => TResult;
declare type Func3<T1, T2, T3, TResult> = (arg1: T1, arg2: T2, arg3: T3) => TResult;

declare type Action          = () => void;
declare type Action1<T1>     = (arg: T1) => void;
declare type Action2<T1, T2> = (arg1: T1, arg2: T2) => void;

declare interface Constructor<T> extends Function
{
    new():     T;
    new(...args: Array<any>);
    prototype: T;
}

declare type Nullable<T> = T|null|undefined;

declare namespace ShadyCSS
{
    function prepareTemplate(template: HTMLTemplateElement, name: string, element?: string);
    function styleElement(element: HTMLElement);
}