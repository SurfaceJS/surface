import type { IDisposable } from "@surface/core";
import type StackTrace      from "../../types/stack-trace";

type AttributeFactory = (element: HTMLElement, scope: object, directives: Map<string, DirectiveEntry>, stackTrace?: StackTrace) => IDisposable;

export default AttributeFactory;