import Directive from "../../internal/directives/directive.js";

export default class CustomDirectiveHandler extends Directive
{
    protected onValueChange(value: string): void
    {
        this.element.textContent = `${this.key}: ${value}`;
    }
}