import { Indexer, IDisposable } from "@surface/core";
import IDirective               from "./interfaces/directive";

export type DirectiveHandlerConstructor = new (scope: Scope, element: Element, directive: IDirective) => IDisposable;
export type Scope                       = Indexer & { host?: HTMLElement };
export type StackTrace                  = Array<Array<string>>;
export type Observables                 = Array<Array<string>>;