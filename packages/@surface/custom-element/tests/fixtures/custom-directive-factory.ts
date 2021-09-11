import type Directive         from "../../internal/directives/directive-legacy.js";
import type DirectiveContext  from "../../internal/types/directive-context-legacy.js";
import CustomDirective from "./custom-directive.js";

const customDirectiveFactory = (context: DirectiveContext): Directive =>
    new CustomDirective(context);

export default customDirectiveFactory;