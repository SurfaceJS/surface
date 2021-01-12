import type { Constructor }      from "@surface/core";
import { stringToCSSStyleSheet } from "../common.js";
import StaticMetadata            from "../metadata/static-metadata.js";

export default function styles(...styles: string[]): <T extends Constructor<HTMLElement>>(target: T) => T
{
    return <T extends Constructor<HTMLElement>>(constructor: T) =>
    {
        StaticMetadata.from(constructor).styles.push(...styles.map(stringToCSSStyleSheet));

        return constructor;
    };
}