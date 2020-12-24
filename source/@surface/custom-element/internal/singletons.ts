import Scheduler                                                     from "./processors/scheduler.js";
import type { DirectiveHandlerConstructor, DirectiveHandlerFactory } from "./types";

export const directiveRegistry = new Map<string, DirectiveHandlerConstructor | DirectiveHandlerFactory>();
export const scheduler         = new Scheduler(16.17);