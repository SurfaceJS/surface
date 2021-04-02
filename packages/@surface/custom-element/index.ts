/* eslint-disable @typescript-eslint/indent */
import CustomElement from "./internal/custom-element.js";

export type { default as ICustomElement }   from "./internal/interfaces/custom-element";
export type { default as ICustomDirective } from "./internal/interfaces/custom-directive";

export type
{
    DirectiveHandlerConstructor,
    DirectiveHandlerFactory,
} from "./internal/types";

export { computed, notify, observe }   from "@surface/reactive";
export { default as attribute }        from "./internal/decorators/attribute.js";
export { default as define }           from "./internal/decorators/define.js";
export { default as element }          from "./internal/decorators/element.js";
export { default as event }            from "./internal/decorators/event.js";
export { query, queryAll }             from "./internal/decorators/query.js";
export { default as styles }           from "./internal/decorators/styles.js";
export { default as DirectiveHandler } from "./internal/directives/handlers/directive-handler.js";
export { default as processTemplate }  from "./internal/processors/process-template.js";
export { paintingDone, scheduler }     from "./internal/singletons.js";

export default CustomElement;