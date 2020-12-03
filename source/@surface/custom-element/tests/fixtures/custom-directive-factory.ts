import DirectiveHandler       from "../../internal/directives/handlers";
import ICustomDirective       from "../../internal/interfaces/custom-directive";
import CustomDirectiveHandler from "./custom-directive";

const customDirectiveFactory = (scope: object, element: HTMLElement, directive: ICustomDirective): DirectiveHandler =>
    new CustomDirectiveHandler(scope, element, directive);

export default customDirectiveFactory;