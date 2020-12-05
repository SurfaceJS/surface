import DirectiveHandler from "../directives/handlers/directive-handler";
import ICustomDirective from "../interfaces/custom-directive";
import IInjectDirective from "../interfaces/inject-directive";

export type DirectiveHandlerConstructor = (new (scope: object, element: HTMLElement, directive: ICustomDirective) => DirectiveHandler);
export type DirectiveHandlerFactory     = (scope: object, element: HTMLElement, directive: ICustomDirective) => DirectiveHandler;
export type DirectiveHandlerRegistry    = { name: string, handler: DirectiveHandlerConstructor | DirectiveHandlerFactory};
export type Injection                   = { scope: object, context: Node, host: Node, template: HTMLTemplateElement, directive: IInjectDirective };
export type Observables                 = string[][];
export type StackTrace                  = string[][];