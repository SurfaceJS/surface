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
import type ICallSetup            from "./interfaces/call-setup";
import type IExecutable           from "./interfaces/executable";
import type IGetSetup             from "./interfaces/get-setup";
import type IReturnsInstanceSetup from "./interfaces/returns-instance-setup";
import type IReturnsSetup         from "./interfaces/returns-setup";
import ReturnSetup                from "./return-setup.js";

const CALL          = Symbol("mock:call");
const MOCK_INSTANCE = Symbol("mock:instance");
const NEW           = Symbol("mock:new");

type Mode = "strict" | "loose";

export default class Mock<T extends object | Function>
{
    private readonly setups: Map<string | symbol | number, IExecutable> = new Map();
    private mode: Mode = "loose";

    public readonly proxy: T;

    public constructor(target: T, mode: Mode = "loose")
    {
        this.mode  = mode;
        this.proxy = this.createProxy(target);
    }

    public static callable<T extends Callable>(): Mock<T>
    {
        const callable = () => void 0;

        return new Mock(callable as T);
    }

    public static newable<T extends Newable>(): Mock<T>
    {
        return new Mock(class { } as T);
    }

    public static instance<T extends object>(): Mock<T>
    {
        return new Mock({ } as T);
    }

    public static of<T extends object | Function>(target: T): Mock<T> | undefined
    {
        return Reflect.get(target, MOCK_INSTANCE);
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
                    this.throwKeyDoesNotHasSetup("callable");
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
                    this.throwKeyDoesNotHasSetup("newable");
                }

                return Reflect.construct(target as Function, args, newTarget);
            },
            get: (target, propertyKey, receiver) =>
            {
                if (propertyKey == MOCK_INSTANCE)
                {
                    return this;
                }

                const setup = this.setups.get(propertyKey);

                if (setup)
                {
                    return setup.execute();
                }
                else if (this.mode == "strict")
                {
                    this.throwKeyDoesNotHasSetup(propertyKey);
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
                else if (this.mode == "strict")
                {
                    this.throwKeyDoesNotHasSetup(propertyKey);
                }

                return descriptor;
            },
        };

        return new Proxy(target, handler);
    }

    private throwKeyDoesNotHasSetup(key: PropertyKey): never
    {
        throw new Error(`${typeof key == "symbol" ? key.description : key} does not has setup`);
    }

    public call(...args: Parameters<Cast<T, Callable>>): IReturnsSetup<Cast<T, Callable>>;
    public call<TOverload extends Overload<Cast<T, Callable>, ParameterOverloads<Cast<T, Callable>>>>(...args: Parameters<TOverload>): IReturnsSetup<TOverload>;
    public call<TArgs extends ParameterOverloads<Cast<T, Callable>>>(...args: TArgs): IReturnsSetup<Overload<Cast<T, Callable>, TArgs>>
    {
        const setup = this.setup(CALL);

        return setup.call(...args) as object as IReturnsSetup<Overload<Cast<T, Callable>, TArgs>>;
    }

    public clear(): void
    {
        this.setups.clear();
    }

    public lock(): void
    {
        this.mode = "strict";
    }

    public new(...args: ConstructorParameters<Cast<T, Newable>>): IReturnsInstanceSetup<Cast<T, Newable>>;
    public new<TOverload extends ConstructorOverload<Cast<T, Newable>, ParameterOverloads<Cast<T, Callable>>>>(...args: ConstructorParameters<TOverload>): IReturnsInstanceSetup<Cast<TOverload, Newable>>;
    public new<TArgs extends ConstructorParameterOverloads<Cast<T, Newable>>>(...args: TArgs): IReturnsInstanceSetup<ConstructorOverload<Cast<T, Newable>, TArgs>>
    {
        const setup = this.setup(NEW);

        return setup.call(...args) as object as IReturnsInstanceSetup<ConstructorOverload<Cast<T, Newable>, TArgs>>;
    }

    public release(): void
    {
        this.mode = "loose";
        this.setups.clear();
    }

    public setup<K extends keyof T>(key: K | symbol | number): ICallSetup<Cast<T[K], Callable>>
    public setup<K extends keyof T>(key: K | symbol | number = CALL): ICallSetup<Cast<T[K], Callable>>
    {
        let setup = this.setups.get(key);

        if (!setup)
        {
            this.setups.set(key, setup = new CallSetup());
        }

        return setup as object as ICallSetup<Cast<T[K], Callable>>;
    }

    public setupGet<K extends keyof T>(key: K): IGetSetup<T[K]>
    {
        let setup = this.setups.get(key);

        if (!setup)
        {
            this.setups.set(key, setup = new ReturnSetup());
        }

        return setup as object as IGetSetup<T[K]>;
    }

    public unlock(): void
    {
        this.mode = "loose";
    }
}