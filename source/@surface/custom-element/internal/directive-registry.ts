import OnDirectiveHandler              from "./directives/handlers/on-directive-handler";
import { DirectiveHandlerConstructor } from "./types";

const directiveRegistry = new Map<string, DirectiveHandlerConstructor>();

directiveRegistry.set("on", OnDirectiveHandler);

export default directiveRegistry;