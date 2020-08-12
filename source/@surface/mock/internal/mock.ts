import { Constructor } from "../../core";
import CallSetup       from "./call-setup";
import ICallSetup      from "./interfaces/call-setup";
import IExecutable     from "./interfaces/executable";
import IGetSetup       from "./interfaces/get-setup";
import ReturnSetup     from "./return-setup";
import { Method }      from "./types";

export default class Mock<T extends object>
{
    private readonly setups: Map<string | symbol | number, IExecutable> = new Map();

    public readonly proxy: T;

    public constructor(target: T | (Constructor<T> & Function) = { } as T)
    {
        this.proxy = this.createProxy(typeof target == "object" ? target : target.prototype);
    }

    private createProxy(target: T): T
    {
        const handler: ProxyHandler<T> =
        {
            get: (_, key) =>
            {
                const setup = this.setups.get(key);

                if (setup)
                {
                    return setup.execute();
                }

                return target[key as keyof T];
            },
            getOwnPropertyDescriptor: (_, key) =>
            {
                const setup = this.setups.get(key);

                const descriptor = Object.getOwnPropertyDescriptor(target, key);

                if (setup)
                {
                    const value = setup.execute();

                    if (descriptor && !descriptor.get && !descriptor.set)
                    {
                        return { ...descriptor, value };
                    }

                    return { configurable: true, enumerable: true, value, writable: true };
                }

                return descriptor;
            },
        };

        return new Proxy(target, handler);
    }

    public setup<K extends keyof T, F extends Method<T, K>>(key: K | symbol | number): ICallSetup<F>
    {
        let setup = this.setups.get(key);

        if (!setup)
        {
            this.setups.set(key, setup = new CallSetup());
        }

        return setup as object as ICallSetup<F>;
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
}