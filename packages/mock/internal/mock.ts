import { type MockModuleContext, type MockModuleOptions, mock as nodeTestMock } from "node:test";
import type
{
    Callable,
    Cast,
    ConstructorOverload,
    ConstructorParameterOverloads,
    Newable,
    Overload,
    ParameterOverloads,
} from "@surface/core";
import CallSetup                  from "./call-setup.js";
import type ICallSetup            from "./interfaces/call-setup.js";
import type IExecutable           from "./interfaces/executable.js";
import type IGetSetupSync         from "./interfaces/get-setup-sync.js";
import type IReturnsInstanceSetup from "./interfaces/returns-instance-setup.js";
import ReturnSetup                from "./return-setup.js";
import type ResolveSetup          from "./types/resolve-setup.js";

const CALL = Symbol("mock:call");
const NEW  = Symbol("mock:new");

const INSTANCE_TARGET = { };
const CALLABLE_TARGET = () => void 0;
const NEWABLE_TARGET  = class { };

const isAllowed = (target: object, key: PropertyKey): boolean =>
    typeof target == "function"
        ? key in Function.prototype
        : key in Object.prototype || key in Promise.prototype;

type Mode = "strict" | "loose";

export default class Mock<T extends object | Function>
{
    private readonly setups: Map<string | symbol | number, IExecutable> = new Map();
    private mode: Mode = "loose";

    /** Instance proxy. */
    public readonly proxy: T;

    /**
     * Creates an mock using an host target
     * @param target Object that will handle non setups calls.
     * @param mode When strict, all non setups calls will throw an exception.
     */
    public constructor(target: T, mode: Mode = "loose")
    {
        this.mode  = mode;
        this.proxy = this.createProxy(target);
    }

    /** Creates a function mock. */
    public static callable<T extends Callable>(): Mock<T>
    {
        return new Mock(CALLABLE_TARGET as T, "strict");
    }

    /** Creates a class constructor mock. */
    public static newable<T extends Newable>(): Mock<T>
    {
        return new Mock(NEWABLE_TARGET as T, "strict");
    }

    /** Creates an object mock. */

    public static instance<T extends object>(): Mock<T>
    {
        return new Mock(INSTANCE_TARGET as T, "strict");
    }

    /**
     * Mocks a module using node:test's global mock tracker.
     * Only bare specifiers (e.g. "node:fs", "@surface/rwx") and absolute path
     * specifiers are allowed; relative specifiers are rejected.
     * @param specifier Module identifier to mock.
     * @param options Mock module options (exports, namedExports, cache).
     */
    public static module(specifier: string | URL, options?: MockModuleOptions): MockModuleContext
    {
        if (typeof specifier == "string" && (specifier.startsWith("./") || specifier.startsWith("../")))
        {
            throw new Error(`Mock.module does not support relative specifiers: "${specifier}". Use a bare or absolute path specifier instead.`);
        }

        return nodeTestMock.module(specifier, options);
    }

    private createProxy(target: T): T
    {
        const handler: ProxyHandler<T> =
        {
            apply: (target, thisArgument, args) =>
            {
                const setup = this.setups.get(CALL);

                if (setup)
                {
                    return (setup.execute() as Callable)(...args);
                }
                else if (this.mode == "strict")
                {
                    throw new Error(`${this.getTargetName(target)} does not has "callable" setup`);
                }

                return Reflect.apply(target as Function, thisArgument, args);
            },
            construct: (target, args, newTarget) =>
            {
                const setup = this.setups.get(NEW);

                if (setup)
                {
                    return (setup.execute() as Callable)(...args) as object;
                }
                else if (this.mode == "strict")
                {
                    throw new Error(`${this.getTargetName(target)} does not has "newable" setup`);
                }

                return Reflect.construct(target as Function, args, newTarget);
            },
            get: (target, propertyKey, receiver) =>
            {
                const setup = this.setups.get(propertyKey);

                if (setup)
                {
                    return setup.execute();
                }
                else if (this.mode == "strict" && !isAllowed(target, propertyKey))
                {
                    throw new Error(`${this.getTargetName(target)}.${String(propertyKey)} does not has "get" setup`);
                }

                return Reflect.get(target, propertyKey, receiver);
            },
            getOwnPropertyDescriptor: (target, propertyKey) =>
            {
                const setup = this.setups.get(propertyKey);

                const descriptor = Reflect.getOwnPropertyDescriptor(target, propertyKey);

                if (setup)
                {
                    const value = setup.execute();

                    if (descriptor && !descriptor.get && !descriptor.set)
                    {
                        return { ...descriptor, value };
                    }

                    return { configurable: true, enumerable: true, value, writable: true };
                }
                else if (this.mode == "strict" && !isAllowed(target, propertyKey))
                {
                    throw new Error(`${this.getTargetName(target)}.${typeof propertyKey == "symbol" ? `[Symbol(${propertyKey.description})]` : propertyKey} does not has "get" setup`);
                }

                return descriptor;
            },
        };

        return new Proxy(target, handler);
    }

    private getTargetName(target: object): string
    {
        return target == INSTANCE_TARGET
            ? "Instance target"
            : target == CALLABLE_TARGET
                ? "Callable target"
                : target == NEWABLE_TARGET
                    ? "Newable target"
                    : typeof target == "function"
                        ? target.name
                        : target.toString();
    }

    /** Configures call. */
    public call(...args: Parameters<Cast<T, Callable>>): ResolveSetup<Cast<T, Callable>>;
    public call<TOverload extends Overload<Cast<T, Callable>, ParameterOverloads<Cast<T, Callable>>>>(...args: Parameters<TOverload>): ResolveSetup<TOverload>;
    public call<TArgs extends ParameterOverloads<Cast<T, Callable>>>(...args: TArgs): ResolveSetup<Overload<Cast<T, Callable>, TArgs>>
    {
        const setup = this.setup(CALL);

        return setup.call(...args) as object as ResolveSetup<Overload<Cast<T, Callable>, TArgs>>;
    }

    /** Removes all setups. */
    public clear(): void
    {
        this.setups.clear();
    }

    /** Prevents method calls and property accesses that do not have setup. */
    public lock(): void
    {
        this.mode = "strict";
    }

    /** Configures the constructor. */
    public new(...args: ConstructorParameters<Cast<T, Newable>>): IReturnsInstanceSetup<Cast<T, Newable>>;
    public new<TOverload extends ConstructorOverload<Cast<T, Newable>, ParameterOverloads<Cast<T, Callable>>>>(...args: ConstructorParameters<TOverload>): IReturnsInstanceSetup<Cast<TOverload, Newable>>;
    public new<TArgs extends ConstructorParameterOverloads<Cast<T, Newable>>>(...args: TArgs): IReturnsInstanceSetup<ConstructorOverload<Cast<T, Newable>, TArgs>>
    {
        const setup = this.setup(NEW);

        return setup.call(...args) as object as IReturnsInstanceSetup<ConstructorOverload<Cast<T, Newable>, TArgs>>;
    }

    /** Removes all setups and unlocks the mock. */
    public release(): void
    {
        this.mode = "loose";
        this.setups.clear();
    }

    /** Creates method setup. */
    public setup<K extends keyof T>(key: K): ICallSetup<Cast<T[K], Callable>>;
    public setup(key: PropertyKey): ICallSetup;
    public setup(key: PropertyKey = CALL): ICallSetup
    {
        let setup = this.setups.get(key);

        if (!setup)
        {
            this.setups.set(key, setup = new CallSetup());
        }

        return setup as object as ICallSetup;
    }

    /** Creates property setup. */
    public setupGet<K extends keyof T>(key: K): IGetSetupSync<T[K]>;
    public setupGet(key: PropertyKey): IGetSetupSync;
    public setupGet(key: PropertyKey): IGetSetupSync
    {
        let setup = this.setups.get(key);

        if (!setup)
        {
            this.setups.set(key, setup = new ReturnSetup());
        }

        return setup as object as IGetSetupSync;
    }

    /** Removes lock. */
    public unlock(): void
    {
        this.mode = "loose";
    }
}
