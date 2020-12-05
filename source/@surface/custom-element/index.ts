import CustomElement from "./internal/custom-element";

export type { default as ICustomElement }   from "./internal/interfaces/custom-element";
export type { default as ICustomDirective } from "./internal/interfaces/custom-directive";

export * from "./internal/custom-element";
export * from "./internal/processors/process-template";
export * from "./internal/singletons";

export { default as attribute }        from "./internal/decorators/attribute";
export { default as define }           from "./internal/decorators/define";
export { default as element }          from "./internal/decorators/element";
export { default as event }            from "./internal/decorators/event";
export { query, queryAll }             from "./internal/decorators/query";
export { default as styles }           from "./internal/decorators/styles";
export { default as DirectiveHandler } from "./internal/directives/handlers/directive-handler";
export default CustomElement;