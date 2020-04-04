import { Indexer } from "@surface/core";
import IDisposable from "@surface/core/interfaces/disposable";
import IExpression from "@surface/expression/interfaces/expression";

export type DirectiveHandlerConstructor = new (scope: Scope, element: Element, key: IExpression, expression: IExpression) => IDisposable;
export type Scope                       = Indexer & { host?: HTMLElement };