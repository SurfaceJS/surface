import Directive from "../../../internal/aot/directive.js";

export default class CustomDirective extends Directive
{
    protected onValueChange(value: string): void
    {
        this.context.element.appendChild(document.createTextNode(`${this.context.key}: ${value}`));
    }
}