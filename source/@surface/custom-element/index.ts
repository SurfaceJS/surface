import CustomElement from "./internal/custom-element";

export { default as DirectiveHandler }      from "./internal/directives/handlers";
export type { default as ICustomElement }   from "./internal/interfaces/custom-element";
export type { default as ICustomDirective } from "./internal/interfaces/directives/custom-directive";

export * from "./internal/custom-element";
export * from "./internal/decorators";
export * from "./internal/processors";

export default CustomElement;