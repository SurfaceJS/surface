/* eslint-disable @typescript-eslint/indent */
import CustomElement from "./internal/custom-element.js";

export type { default as ICustomElement }                 from "./internal/interfaces/custom-element";
export type { default as CustomElementDefinitionOptions } from "./internal/types/custom-element-definition-options";
export type { default as DirectiveContext }               from "./internal/types/directive-context";

export type
{
    DirectiveConstructor,
    DirectiveFactory,
} from "./internal/types/directive-entry.js";

export type { AttributeOptions } from "./internal/decorators/attribute.js";

export { default as attribute } from "./internal/decorators/attribute.js";
export { default as computed }  from "./internal/decorators/computed.js";
export { default as define }    from "./internal/decorators/define.js";
export { default as element }   from "./internal/decorators/element.js";
export { default as event }     from "./internal/decorators/event.js";
export { default as listener }  from "./internal/decorators/listener.js";
export { query, queryAll }      from "./internal/decorators/query.js";
export { default as styles }    from "./internal/decorators/styles.js";
export { default as Directive } from "./internal/directives/directive.js";
export { scheduler, painting }  from "./internal/singletons.js";

export default CustomElement;