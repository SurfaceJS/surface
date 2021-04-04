import type Directive           from "../../internal/directives/directive.js";
import type DirectiveDescriptor from "../../internal/types/directive-descriptor";
import CustomDirectiveHandler   from "./custom-directive.js";

const customDirectiveFactory = (scope: object, element: HTMLElement, descriptor: DirectiveDescriptor): Directive =>
    new CustomDirectiveHandler(scope, element, descriptor);

export default customDirectiveFactory;