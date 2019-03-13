// import { Func, Indexer } from "@surface/core";
// import { getValue }      from "@surface/core/common/object";
// import ISubject          from "@surface/observer/interfaces/subject";
// import ISubscription     from "@surface/observer/interfaces/subscription";
// import Type              from "@surface/reflection";
// import FieldInfo         from "@surface/reflection/field-info";
// import PropertyInfo      from "@surface/reflection/property-info";
// import MethodInfo        from "../reflection/method-info";
// import ReactiveObserver  from "./internal/reactive-observer";
// import ReactiveSubject   from "./internal/reactive-subject";

// export const CONTRACTS = Symbol("reactive:contracts");
// export const METADATA  = Symbol("reactive:metadata");

// type Metadata =
// {
//     dependencies:  Map<string|symbol, Metadata>;
//     subjects:      Map<string|symbol, ISubject>;
//     subscriptions: Map<Reactiveable,  Array<ISubscription>>;
// };

// export type Reactiveable = Indexer &
// {
//     [METADATA]?:  Metadata;
// };

// type ReactiveKey = keyof Reactiveable;

// export default class Reactive
// {
//     private static breakContracts(target: Reactiveable): void
//     {
//         target[METADATA]!.subscriptions.forEach(subscriptions => subscriptions.forEach(x => x.unsubscribe()));
//     }

//     private static createMetadata(): Metadata
//     {
//         return { dependencies: new Map(), subjects: new Map(), subscriptions: new Map() };
//     }

//     private static cloneMetadata(metadata: Metadata): Metadata
//     {
//         const subjects = new Map();
//         Array.from(metadata.subjects.entries()).map(([key, subject]) => subjects.set(key, (subject as ReactiveSubject).clone()));

//         const copy =
//         {
//             dependencies:  new Map(metadata.dependencies),
//             subjects,
//             subscriptions: new Map(metadata.subscriptions),
//         } as Metadata;

//         return copy;
//     }

//     private static makeReactive(target: Reactiveable, key: string|symbol): void
//     {
//         const member = Type.from(target).getMember(key);

//         if (member instanceof PropertyInfo)
//         {
//             if (!member.readonly)
//             {
//                 Object.defineProperty
//                 (
//                     target,
//                     member.key,
//                     {
//                         get: member.getter as Func<unknown>|undefined,
//                         set(this: Reactiveable, value: unknown)
//                         {
//                             const metadata = this[METADATA]!;

//                             if (!member.getter || !Object.is(member.getter.call(this), value))
//                             {
//                                 member.setter!.call(this, value);

//                                 const subject = metadata.subjects.get(member.key);

//                                 if (subject)
//                                 {
//                                     subject.notify(value);
//                                 }
//                             }
//                         }
//                     }
//                 );
//             }
//             else if (`_${member.key.toString()}` in target)
//             {
//                 const privateKey = `__${member.key.toString()}__` as ReactiveKey;
//                 target[privateKey] = target[member.key as ReactiveKey];

//                 Object.defineProperty
//                 (
//                     target,
//                     `_${member.key.toString()}`,
//                     {
//                         get(this: Reactiveable)
//                         {
//                             return this[privateKey];
//                         },
//                         set(this: Reactiveable, value: unknown)
//                         {
//                             const metadata = this[METADATA]!;

//                             if (!Object.is(value, this[privateKey]))
//                             {
//                                 this[privateKey] = value;

//                                 const subject = metadata.subjects.get(member.key);

//                                 if (subject)
//                                 {
//                                     subject.notify(value);
//                                 }
//                             }
//                         }
//                     }
//                 );
//             }
//         }
//         else if (member instanceof FieldInfo)
//         {
//             const privateKey = typeof member.key == "symbol" ?
//                 Symbol(`_${member.key.toString()}`) as ReactiveKey
//                 : `_${member.key.toString()}` as ReactiveKey;

//             target[privateKey] = member.value;

//             Object.defineProperty
//             (
//                 target,
//                 member.key,
//                 {
//                     get(this: Reactiveable)
//                     {
//                         return this[privateKey];
//                     },
//                     set(this: Reactiveable, value: unknown)
//                     {
//                         const metadata  = this[METADATA]!;
//                         const oldValue  = this[privateKey];

//                         if (!Object.is(value, oldValue))
//                         {
//                             this[privateKey] = value;

//                             if (value instanceof Object && metadata.dependencies.has(member.key) && !Reactive.isReactive(value))
//                             {
//                                 if (Reactive.isReactive(oldValue))
//                                 {
//                                     Reactive.breakContracts(oldValue);
//                                 }

//                                 Reactive.rebuild(value, metadata.dependencies.get(member.key)!);
//                             }

//                             const subject = metadata.subjects.get(member.key);

//                             if (subject)
//                             {
//                                 subject.notify(value);
//                             }
//                         }
//                     }
//                 }
//             );
//         }
//         else if (member instanceof MethodInfo)
//         {
//             target[member.key as ReactiveKey] = function(...args: Array<unknown>)
//             {
//                 const subject = this[METADATA]!.subjects.get(member.key);

//                 if (subject)
//                 {
//                     subject.notify(member.invoke.call(target, args));
//                 }
//             };
//         }
//     }

//     private static isReactive(target: unknown): target is Reactiveable;
//     private static isReactive(target: Reactiveable): boolean;
//     private static isReactive(target: Reactiveable): boolean
//     {
//         return target && !!target[METADATA];
//     }

//     private static rebuild(target: Reactiveable, metadata: Metadata): void
//     {
//         for (const [key, dependency] of metadata.dependencies)
//         {
//             Reactive.makeReactive(target, key);
//             Reactive.rebuild(target[key as ReactiveKey] as Indexer, dependency);
//         }

//         target[METADATA] = Reactive.cloneMetadata(metadata);

//         target[METADATA]!.subjects.forEach((subject, key) => subject.notify(target[key as ReactiveKey]));
//     }

//     public static observe(target: Reactiveable, key: string|symbol): ISubject
//     {
//         const metadata = target[METADATA] = target[METADATA] || Reactive.createMetadata();

//         if (!metadata.subjects.has(key))
//         {
//             metadata.subjects.set(key, new ReactiveSubject());

//             Reactive.makeReactive(target, key);
//         }

//         return metadata.subjects.get(key)!;
//     }

//     public static oneWay(left: Reactiveable, leftPath: string|symbol, right: Reactiveable, rightPath: string|symbol): void
//     {
//         const metadata = left[METADATA] = left[METADATA] || Reactive.createMetadata();

//         if (typeof rightPath == "string" && rightPath.indexOf(".") > -1)
//         {
//             const keys = rightPath.split(".");
//             const key  = keys.pop()!;

//             const member = getValue(right, keys.join(".")) as Indexer;

//             Reactive.oneWay(left, leftPath, member, key);
//         }
//         else if (typeof leftPath == "string" && leftPath.indexOf(".") > -1)
//         {
//             const [key, ...keys] = typeof leftPath == "string" ? leftPath.split(".") : [leftPath];

//             const subject = Reactive.observe(left, key);

//             subject.notify(left[key]);

//             const member = left[key] as Reactiveable;

//             Reactive.oneWay(member, keys.join("."), right, rightPath);

//             const dependency = member[METADATA]!;

//             metadata.dependencies.set(key, Reactive.cloneMetadata(dependency));
//         }
//         else
//         {
//             const observer = new ReactiveObserver(right, rightPath);

//             observer.update(left[leftPath as keyof Indexer]);

//             if (!metadata.subscriptions.has(right))
//             {
//                 metadata.subscriptions.set(right, []);
//             }

//             metadata.subscriptions.get(right)!.push(Reactive.observe(left, leftPath).subscribe(observer));
//         }
//     }

//     public static twoWay(left: Indexer, leftKey: string|symbol, right: Indexer, rightKey: string|symbol): void
//     {
//         Reactive.oneWay(left, leftKey, right, rightKey);
//         Reactive.oneWay(right, rightKey, left, leftKey);
//     }
// }