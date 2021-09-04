import type Directive         from "../../../internal/aot/directive.js";
import type DirectiveContext  from "../../../internal/aot/types/directive-context.js";
import CustomDirective        from "./custom-directive.js";

const customDirectiveFactory = (context: DirectiveContext): Directive =>
    new CustomDirective(context);

export default customDirectiveFactory;