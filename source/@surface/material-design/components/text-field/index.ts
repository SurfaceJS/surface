import { mixer }                               from "@surface/core/common/object";
import CustomElement                           from "@surface/custom-element";
import { attribute, computed, element, query } from "@surface/custom-element/decorators";
import colorable                               from "../../mixins/colorable";
import lineRippleable                          from "../../mixins/line-rippleable";
import themeable                               from "../../mixins/themeable";
import template                                from "./index.html";
import style                                   from "./index.scss";

@element("smd-text-field", template, style)
export default class TextField extends mixer(CustomElement, [colorable, lineRippleable, themeable])
{
    @query("#root")
    protected colorable!: HTMLElement;

    protected get noRipple(): boolean
    {
        return this.outlined;
    }

    protected input!: HTMLElement;

    @query("#inputable", true)
    protected inputable!: HTMLElement;

    @query(".rippleable", true)
    protected rippleable!: HTMLElement;

    public active: boolean = false;

    @attribute
    public filled: boolean = false;

    @attribute
    public hint: string = "";

    @attribute
    public label: string = "";

    @attribute
    public outlined: boolean = false;

    @attribute
    public persistentHint: boolean = false;

    @attribute
    public inline: boolean = false;

    @attribute
    public value: string = "";

    @computed("active", "inline", "filled", "label", "outlined", "persistentHint", "value")
    public get classes(): Record<string, boolean>
    {
        return {
            active:    this.active,
            filled:    this.filled,
            hintable:  this.active || this.persistentHint,
            inline:    this.inline,
            lableable: !!this.label,
            outlined:  this.outlined,
            valuable:  !!this.value
        };
    }

    public constructor()
    {
        super();

        this.inputable.addEventListener("click", () => this.input.focus());
        this.addEventListener("focus", () => this.active = true);
        this.addEventListener("focusout", () => this.active = false);
    }
}

declare global
{
    // tslint:disable-next-line:interface-name
    interface HTMLElementTagNameMap
    {
        "smd-text-field": TextField;
    }
}