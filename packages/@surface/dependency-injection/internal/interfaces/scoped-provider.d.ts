import type { IDisposable } from "@surface/core";

export default interface IScopedProvider extends IDisposable
{

    /** Instantiate and inject constructor parameters and properties. */
    inject<T extends Constructor>(target: T): InstanceType<T>;

    /** Inject properties on the provided instance. */
    inject<T extends object>(target: T): T;

    /**
     * Returns resolved dependency.
     * @param key Key used to resolve instance.
     **/
    resolve<T extends object = object>(key: string | symbol): T;

    /**
     * Returns resolved dependency.
     * @param key Key used to resolve instance.
     **/
    resolve<T>(key: Constructor<T>): T;
}