# Summary

* [Introduction](#introduction)
* [Basic setup](#basic-setup)
* [Injection](#injection)
* [Registration](#registration)
  * [Singleton](#singleton)
  * [Transient](#transient)
  * [Scoped](#scoped)
  * [Scoped Provider](#scoped-provider)
* [Hierarchy](#hierarchy)
* [Provider](#provider)

## Introduction

Provides dependency injection capabilities.

## Basic setup

```ts
import Container, { inject } from "@surface/dependency-injection";

const KEY = Symbol();

const container = new Container();

class A { }

class B { }

// Register dependency using a key or using itself as key
container.registerSingleton(KEY, A);
container.registerSingleton(B);

class MyClass
{
    @inject(B) private readonly b!: B

    // Annotate constructor parameter using the registered key
    public constructor(@inject(KEY) private readonly a: A)
    { }
}

// Resolve injected instance using the registered key
const a = container.resolve(KEY);

// Inject dependency using the constructor with annotated dependencies
const b = container.inject(MyClass);
```

## Injection

The container can inject both constructor parameters and properties.

Note that properties are injected after instantiation and will not be accessible in the constructor.

## Registration

Are three types of registration `Transient`, `Singleton` and `Scoped`.

### Transient

Are always resolved to a new instance and never disposed by the container.

### Singleton

After resolved persists until the container is disposed.

### Scoped

When resolved by the container, the injection will be resolved to the same instance in the scope of the `resolve` or `inject` call and will not disposed by the container.

### Scoped provider

Creating scopes allows dependencies to persist until the scope is dropped.

```ts
import Container, { inject } from "@surface/dependency-injection";

const container = new Container();

class MyClass { }

// Register dependency using a key
container.registerScoped(MyClass);

// Inject dependency using the constructor with annotated dependencies
const scope = container.createScope();

const a = scope.resolve(MyClass);
const b = scope.resolve(MyClass);

a == b; // true;

scope.dispose(); // Clear scope and call the dispose method of all cached instancies.
```

## Hierarchy

When the container is nested. The dependency will be resolved from bottom up. Following the container instance registration type.

Disposing a child container does not affect the parent and vice versa.

```ts
import Container, { inject } from "@surface/dependency-injection";

const parent = new Container();
const child  = new Container(parent);


class A { }
class B { }

child.registerSingleton(A);
parent.registerSingleton(B);

// Inject dependency using the constructor with annotated dependencies.
const scope = container.createScope();

const a = child.resolve(A); // Resolved and cached on child.
const b = child.resolve(B); // Resolved and cached on parent.
```

## Provider

When building a web app, register all dependencies on single container can increase significantly the load/size of the startup.

In this case, the best practices is break you containers in smaller peaces and distribute where is need.

But we still need a way of connect all together.

This can be done using `provider`.

keys.ts

```ts
const A_KEY                 = Symbol();
const B_KEY                 = Symbol();
const C_KEY = Symbol();

export A_KEY;
export B_KEY;
export C_KEY;
```

c.ts

```ts
export default class C
{ }
```

b.ts

```ts
import Container                        from "@surface/dependency-injection";
import B                                from "./b.ts";
import { B_KEY, SHARED_DEPENDENCY_KEY } from "./keys.ts";

const container = new Container();

container.registerSingleton(B_KEY, B);

@provider(container);
export default class A
{
    public constructor(@inject(B_KEY) private readonly b: B)
    { }
}
```

b.ts

```ts
import { inject }                from "@surface/dependency-injection";
import Type C                    from "./c.ts";
import { SHARED_DEPENDENCY_KEY } from "./keys.ts";

export class B
{
    public constructor(@inject(SHARED_DEPENDENCY_KEY) private readonly c: C)
    { }
}
```

index.ts

```ts
import Container                 from "@surface/dependency-injection";
import C                         from "./c.ts";
import { SHARED_DEPENDENCY_KEY } from "./keys.ts";

const container = new Container();

// In this example, C is registered on the root container while B is registered on container provided by A.
container.registerSingleton(C_KEY, C);

// When injecting in A, the container provided by the A class is placed at bottom of the current container
// and the resolution will follow the hierarchical rules.
const a = container.inject((await import("./a.js")).default);
```
