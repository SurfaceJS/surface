import type { IDisposable } from "@surface/core";
import ICustomDirective     from "./interfaces/directives/custom-directive";
import IInjectDirective     from "./interfaces/directives/inject-directive";

export type DirectiveHandlerConstructor = (new (scope: object, element: HTMLElement, directive: ICustomDirective) => IDisposable);
export type DirectiveHandlerFactory     = (scope: object, element: HTMLElement, directive: ICustomDirective) => IDisposable;
export type DirectiveHandlerRegistry    = DirectiveHandlerConstructor | DirectiveHandlerFactory;
export type Injection                   = { scope: object, context: Node, host: Node, template: HTMLTemplateElement, directive: IInjectDirective };
export type Observables                 = string[][];
export type StackTrace                  = string[][];