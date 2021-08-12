import type Container from "../container.js";
import StaticMetadata from "../metadata.js";

/** Provides a container that will be injected as child of the active container */
export default function provide(container: Container): ClassDecorator
{
    return (target) => void (StaticMetadata.from(target).provider = container);
}