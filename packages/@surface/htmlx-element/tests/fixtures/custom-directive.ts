import { Directive } from "@surface/htmlx";

export default class CustomDirective extends Directive
{
    protected override onValueChange(value: string): void
    {
        this.context.element.appendChild(document.createTextNode(`${this.context.key}: ${value}`));
    }
}
