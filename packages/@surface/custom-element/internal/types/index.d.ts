import type Directive        from "../directives/handlers/directive.js";
import type DirectiveContext from "./directive-context.js";

export type DirectiveConstructor = (new (context: DirectiveContext) => Directive);
export type DirectiveEntry       = DirectiveConstructor | DirectiveFactory;
export type DirectiveFactory     = (context: DirectiveContext) => Directive;
export type Observables          = string[][];
export type StackTrace           = string[][];