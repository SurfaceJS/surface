import Directive from "../../internal/directives/directive.js";

export default class CustomDirectiveHandler extends Directive
{
    protected onValueChange(value: string): void
    {
        this.context.element.textContent = `${this.key}: ${value}`;
    }
}