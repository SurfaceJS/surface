import { Indexer, IDisposable } from "@surface/core";
import ICustomDirective               from "./interfaces/directives/custom-directive";

export type DirectiveHandlerConstructor = new (scope: Scope, element: Element, directive: ICustomDirective) => IDisposable;
export type Scope                       = Indexer & { host?: HTMLElement };
export type StackTrace                  = Array<Array<string>>;
export type Observables                 = Array<Array<string>>;