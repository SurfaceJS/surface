import type { IDisposable } from "@surface/core";
import type DirectiveEntry  from "../../types/directive-entry.js";

type Activator = (parent: Node, host: Node, scope: object, directives: Map<string, DirectiveEntry>) => IDisposable;

export default Activator;
