// import { Action1, Func, Indexer, Nullable } from "@surface/core";
// import Type                                 from "@surface/reflection";
// import FieldInfo                            from "@surface/reflection/field-info";
// import MethodInfo                           from "@surface/reflection/method-info";
// import PropertyInfo                         from "@surface/reflection/property-info";

// export class Observer<TValue = unknown>
// {
//     private readonly _listeners: Array<Action1<TValue>> = [];

//     public get listeners(): Array<Action1<TValue>>
//     {
//         return this._listeners;
//     }

//     public clear(): Observer<TValue>
//     {
//         this._listeners.splice(0, this._listeners.length);
//         return this;
//     }

//     public notify(value: TValue): Observer<TValue>
//     {
//         this._listeners.forEach(listener => listener(value));
//         return this;
//     }

//     public subscribe(...actions: Array<Action1<TValue>>): Observer<TValue>
//     {
//         for (const action of actions)
//         {
//             if (!this._listeners.includes(action))
//             {
//                 this._listeners.push(action);
//             }
//         }

//         return this;
//     }

//     public unsubscribe(...actions: Array<Action1<TValue>>): Observer<TValue>
//     {
//         for (const action of actions)
//         {
//             const index = this._listeners.indexOf(action);

//             if (index > -1)
//             {
//                 this._listeners.splice(this._listeners.indexOf(action), 1);
//             }
//             else
//             {
//                 throw new Error("Action not subscribed");
//             }
//         }

//         return this;
//     }
// }

// export default class PropertyObserver<TTarget, TTKey extends keyof TTarget> extends Observer<TTarget[TTKey]>
// {
//     private readonly key:    TTKey;
//     private readonly target: TTarget;

//     public constructor(target: TTarget, key: TTKey)
//     {
//         super();

//         this.target = target;
//         this.key    = key;
//     }

//     public notify(): Observer<TTarget[TTKey]>
//     {
//         super.notify(this.target[this.key]);
//         return this;
//     }
// }