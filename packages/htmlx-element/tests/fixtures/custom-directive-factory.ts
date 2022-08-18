import type { Directive, DirectiveContext } from "@surface/htmlx";
import CustomDirective                      from "./custom-directive.js";

const customDirectiveFactory = (context: DirectiveContext): Directive =>
    new CustomDirective(context);

export default customDirectiveFactory;