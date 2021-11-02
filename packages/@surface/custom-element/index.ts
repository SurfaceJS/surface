/* eslint-disable @typescript-eslint/indent */
import CustomElement from "./internal/custom-element.js";

export type { default as ICustomElement } from "./internal/interfaces/custom-element";

export type { AttributeOptions } from "./internal/decorators/attribute.js";

export { default as attribute } from "./internal/decorators/attribute.js";
export { default as computed }  from "./internal/decorators/computed.js";
export { default as define }    from "./internal/decorators/define.js";
export { default as element }   from "./internal/decorators/element.js";
export { default as event }     from "./internal/decorators/event.js";
export { default as listener }  from "./internal/decorators/listener.js";
export { query, queryAll }      from "./internal/decorators/query.js";
export { default as styles }    from "./internal/decorators/styles.js";

export default CustomElement;