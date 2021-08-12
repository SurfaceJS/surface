import type { Constructor } from "@surface/core";
import { HookableMetadata } from "@surface/core";
import Metadata             from "../metadata.js";

/**
 * Notifies decorated property when any of provided properties has changed.
 * @param properties Properties to be observed.
 */
export default function computed(...properties: string[]): PropertyDecorator;

/**
 * Notifies decorated property when any of provided properties has changed.
 * @param paths Paths to be observed.
 */
export default function computed(...paths: string[][]): PropertyDecorator;
export default function computed(...propertiesOrPaths: (string | string[])[]): PropertyDecorator
{
    const paths = propertiesOrPaths.map(x => Array.isArray(x) ? x : [x]) as string[][];

    return (target, propertyKey) =>
    {
        const finisher = (instance: object): void => void Metadata.from(instance).computed.set(propertyKey as string, paths);

        HookableMetadata.from(target.constructor as Constructor).finishers.push(finisher);
    };
}
