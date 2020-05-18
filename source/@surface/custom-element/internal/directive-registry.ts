import EventDirectiveHandler           from "./directives/handlers/on-directive-handler";
import { DirectiveHandlerConstructor } from "./types";

const directiveRegistry = new Map<string, DirectiveHandlerConstructor>();

directiveRegistry.set("on", EventDirectiveHandler);

export default directiveRegistry;