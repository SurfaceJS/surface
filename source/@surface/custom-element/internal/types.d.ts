import { Indexer } from "@surface/core";
import IDisposable from "@surface/core/interfaces/disposable";
import IDirective  from "./interfaces/directive";

export type DirectiveHandlerConstructor = new (scope: Scope, element: Element, directive: IDirective) => IDisposable;
export type Scope                       = Indexer & { host?: HTMLElement };