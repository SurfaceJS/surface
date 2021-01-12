import DirectiveHandler from "../../internal/directives/handlers/directive-handler.js";

export default class CustomDirectiveHandler extends DirectiveHandler
{
    protected onValueChange(value: string): void
    {
        this.element.textContent = `${this.key}: ${value}`;
    }
}