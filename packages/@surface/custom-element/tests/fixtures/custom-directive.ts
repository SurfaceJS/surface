import Directive from "../../internal/directives/directive.js";

export default class CustomDirective extends Directive
{
    protected onValueChange(value: string): void
    {
        this.context.element.textContent = `${this.key}: ${value}`;
    }
}