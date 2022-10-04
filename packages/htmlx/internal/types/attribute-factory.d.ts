import type { IDisposable } from "@surface/core";
import type { StackTrace }  from "@surface/htmlx-parser";
import type DirectiveEntry  from "./directive-entry.js";

type AttributeFactory = (element: HTMLElement, scope: object, directives: Map<string, DirectiveEntry>, stackTrace?: StackTrace) => IDisposable;

export default AttributeFactory;
