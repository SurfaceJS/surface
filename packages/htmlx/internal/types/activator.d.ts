import type { IDisposable } from "@surface/core";
import type DirectiveEntry  from "../../types/directive-entry";

type Activator = (parent: Node, host: Node, scope: object, directives: Map<string, DirectiveEntry>) => IDisposable;

export default Activator;

