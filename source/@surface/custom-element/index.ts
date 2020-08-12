import CustomElement    from "./internal/custom-element";
import DirectiveHandler from "./internal/directives/handlers";

import type ICustomElement   from "./internal/interfaces/custom-element";
import type ICustomDirective from "./internal/interfaces/directives/custom-directive";

export type { ICustomElement, ICustomDirective };

export { DirectiveHandler };

export * from "./internal/custom-element";
export * from "./internal/decorators";
export * from "./internal/processors";

export default CustomElement;