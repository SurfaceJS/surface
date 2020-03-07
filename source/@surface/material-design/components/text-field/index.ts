import { assert }                                     from "@surface/core/common/generic";
import { mixer }                                      from "@surface/core/common/object";
import CustomElement                                  from "@surface/custom-element";
import { attribute, computed, element, event, query } from "@surface/custom-element/decorators";
import colorable                                      from "../../mixins/colorable";
import lineRippleable                                 from "../../mixins/line-rippleable";
import themeable                                      from "../../mixins/themeable";
import template                                       from "./index.html";
import style                                          from "./index.scss";

@element("smd-text-field", template, style)
export default class TextField extends mixer(CustomElement, [colorable, lineRippleable, themeable])
{
    private _selectionEnd:   number = 0;
    private _selectionStart: number = 0;

    @query("#root")
    protected colorable!: HTMLElement;

    protected get noRipple(): boolean
    {
        return this.outlined;
    }

    protected input!: HTMLElement;

    @query("#inputable")
    protected inputable!: HTMLElement;

    @query(".rippleable")
    protected rippleable!: HTMLElement;

    public active: boolean = false;

    @attribute
    public counter: boolean = false;

    @attribute
    public filled: boolean = false;

    @attribute
    public hint: string = "";

    @attribute
    public label: string = "";

    @attribute
    public maxLenght: number = 0;

    @attribute
    public outlined: boolean = false;

    @attribute
    public persistentHint: boolean = false;

    @attribute
    public inline: boolean = false;

    @attribute
    public value: string = "";

    public get selectionEnd(): number
    {
        return this._selectionEnd;
    }

    public get selectionStart(): number
    {
        return this._selectionStart;
    }

    @computed("active", "counter", "inline", "filled", "label", "outlined", "persistentHint", "value")
    public get classes(): Record<string, boolean>
    {
        return {
            active:      this.active,
            counterable: this.counter,
            filled:      this.filled,
            hintable:    !!this.hint && (this.active || this.persistentHint),
            inline:      this.inline,
            lableable:   !!this.label,
            outlined:    this.outlined,
            valuable:    !!this.value
        };
    }

    public constructor()
    {
        super();

        this.inputable.addEventListener("click", () => this.input.focus());
        this.addEventListener("focus", () => this.active = true);
        this.addEventListener("focusout", () => this.active = false);
    }

    @event("input")
    protected handleInput(event: InputEvent): void
    {
        event.preventDefault();

        const value = this.input.textContent?.replace(/&nbsp;/g, "") ?? "";

        const remaining = this.maxLenght > 0 ? this.maxLenght - value.length : value.length;

        if (remaining > 0)
        {
            this.value = value;
        }
        else
        {
            this.value = this.input.textContent = value.slice(0, this.maxLenght);

            this.setCaret(this.maxLenght);
        }
    }

    @event("keypress")
    protected handleKeypress(event: KeyboardEvent): void
    {
        if (event.key == "Enter")
        {
            event.preventDefault();
        }
    }

    @event("paste")
    protected handlePaste(event: ClipboardEvent): void
    {
        event.preventDefault();

        this.value = event.clipboardData?.getData("Text") ?? "";
    }

    @event("mousedown")
    @event("mouseup")
    @event("keydown")
    @event("keyup")
    protected handleCaret(): void
    {
        const selection = super.shadowRoot.getSelection();

        assert(selection);

        this._selectionStart = selection.anchorOffset;
        this._selectionEnd   = selection.focusOffset;
    }

    public setCaret(position: number): void
    {
        this.setSelection(position, position);
    }

    public setSelection(start: number, end: number): void
    {
        if (this.input.firstChild)
        {
            const selection = super.shadowRoot.getSelection();

            assert(selection);

            selection.setBaseAndExtent(this.input.firstChild, start, this.input.firstChild, end);

            this._selectionStart = start;
            this._selectionEnd   = end;
        }
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