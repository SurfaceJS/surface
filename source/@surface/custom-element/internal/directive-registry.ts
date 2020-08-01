import OnDirectiveHandler           from "./directives/handlers/on-directive-handler";
import { DirectiveHandlerRegistry } from "./types";

const directiveRegistry = new Map<string, DirectiveHandlerRegistry>();

directiveRegistry.set("on", OnDirectiveHandler);

export default directiveRegistry;