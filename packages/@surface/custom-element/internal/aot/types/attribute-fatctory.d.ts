import type { IDisposable } from "@surface/core";
import type { StackTrace }  from "../../types/index.js";

type AttributeFactory = (element: Element, scope: object, directives: Map<string, DirectiveEntry>, stackTrace?: StackTrace) => IDisposable;

export default AttributeFactory;