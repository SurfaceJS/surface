import { Indexer, IDisposable } from "@surface/core";
import ICustomDirective               from "./interfaces/directives/custom-directive";
import IInjectDirective from "./interfaces/directives/inject-directive";

export type DirectiveHandlerConstructor = new (scope: Scope, element: Element, directive: ICustomDirective) => IDisposable;
export type Scope                       = Indexer;
export type StackTrace                  = Array<Array<string>>;
export type Observables                 = Array<Array<string>>;
export type Injection                   = { scope: Scope, context: Node, host: Node, template: HTMLTemplateElement, directive: IInjectDirective };