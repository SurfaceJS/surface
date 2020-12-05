import { Constructor }           from "@surface/core";
import { stringToCSSStyleSheet } from "../common";
import StaticMetadata            from "../metadata/static-metadata";

export default function styles(...styles: string[]): <T extends Constructor<HTMLElement>>(target: T) => T
{
    return <T extends Constructor<HTMLElement>>(constructor: T) =>
    {
        StaticMetadata.from(constructor).styles.push(...styles.map(stringToCSSStyleSheet));

        return constructor;
    };
}