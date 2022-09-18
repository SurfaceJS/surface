/* eslint-disable @typescript-eslint/indent */
import HTMLXElement from "./internal/htmlx-element.js";

export type { default as IHTMLXElement } from "./internal/interfaces/htmlx-element.js";

export type { AttributeOptions } from "./internal/decorators/attribute.js";

export { default as attribute } from "./internal/decorators/attribute.js";
export { default as computed }  from "./internal/decorators/computed.js";
export { default as define }    from "./internal/decorators/define.js";
export { default as element }   from "./internal/decorators/element.js";
export { default as event }     from "./internal/decorators/event.js";
export { default as listener }  from "./internal/decorators/listener.js";
export { query, queryAll }      from "./internal/decorators/query.js";
export { default as styles }    from "./internal/decorators/styles.js";
export { painting }             from "@surface/htmlx";

export default HTMLXElement;