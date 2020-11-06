import { DirectiveHandlerConstructor, DirectiveHandlerFactory } from "./types";

const directiveRegistry = new Map<string, DirectiveHandlerConstructor | DirectiveHandlerFactory>();

export default directiveRegistry;

