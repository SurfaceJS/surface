import type Directive         from "../../internal/directives/directive.js";
import type DirectiveContext  from "../../internal/types/directive-context.js";
import CustomDirectiveHandler from "./custom-directive.js";

const customDirectiveFactory = (context: DirectiveContext): Directive =>
    new CustomDirectiveHandler(context);

export default customDirectiveFactory;