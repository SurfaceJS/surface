import type DirectiveHandler  from "../../internal/directives/handlers/directive-handler.js";
import type ICustomDirective  from "../../internal/interfaces/custom-directive";
import CustomDirectiveHandler from "./custom-directive.js";

const customDirectiveFactory = (scope: object, element: HTMLElement, directive: ICustomDirective): DirectiveHandler =>
    new CustomDirectiveHandler(scope, element, directive);

export default customDirectiveFactory;