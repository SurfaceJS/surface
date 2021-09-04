import type { IDisposable } from "@surface/core";

type AttributeFactory = (element: Element, scope: object, directives: Map<string, DirectiveEntry>) => IDisposable;

export default AttributeFactory;