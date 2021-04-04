import type DirectiveHandler from "../directives/handlers/directive-handler.js";
import type ICustomDirective from "../interfaces/custom-directive";

export type DirectiveHandlerConstructor = (new (scope: object, element: HTMLElement, directive: ICustomDirective) => DirectiveHandler);
export type DirectiveHandlerFactory     = (scope: object, element: HTMLElement, directive: ICustomDirective) => DirectiveHandler;
export type Observables                 = string[][];
export type StackTrace                  = string[][];