import type DirectiveContext from "./directive-context.js";

type DirectiveEntry = DirectiveConstructor | DirectiveFactory;

export type DirectiveConstructor = (new (context: DirectiveContext) => Directive);
export type DirectiveFactory     = (context: DirectiveContext) => Directive;

export default DirectiveEntry;

