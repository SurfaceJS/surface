import Scheduler                                                from "./processors/scheduler";
import { DirectiveHandlerConstructor, DirectiveHandlerFactory } from "./types";

export const directiveRegistry = new Map<string, DirectiveHandlerConstructor | DirectiveHandlerFactory>();
export const scheduler         = new Scheduler(16.17);