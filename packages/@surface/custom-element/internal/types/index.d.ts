import type Directive            from "../directives/handlers/directive.js";
import type IDirectiveDescriptor from "../interfaces/directive-descriptor";

export type DirectiveConstructor = (new (scope: object, element: HTMLElement, directive: IDirectiveDescriptor) => Directive);
export type DirectiveEntry       = DirectiveConstructor | DirectiveFactory;
export type DirectiveFactory     = (scope: object, element: HTMLElement, directive: IDirectiveDescriptor) => Directive;
export type Observables          = string[][];
export type StackTrace           = string[][];