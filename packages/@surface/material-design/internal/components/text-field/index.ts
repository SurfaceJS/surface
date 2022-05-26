import { assert, mix }                                              from "@surface/core";
import HTMLXElement, { attribute, computed, element, event, query } from "@surface/htmlx-element";
import colorable                                                    from "../../mixins/colorable/index.js";
import lineRippleable                                               from "../../mixins/line-rippleable/index.js";
import themeable                                                    from "../../mixins/themeable/index.js";
import template                                                     from "./index.htmlx";
import style                                                        from "./index.scss";

declare global
{
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface HTMLElementTagNameMap
    {
        "smd-text-field": TextField;
    }
}

@element("smd-text-field", { style, template })
export default class TextField extends mix(HTMLXElement, [colorable, lineRippleable, themeable])
{
    private _selectionEnd:   number = 0;
    private _selectionStart: number = 0;

    @query("#inputable")
    protected inputable!: HTMLElement;

    protected input!: HTMLElement;

    @query("#root")
    public declare colorable: HTMLElement;

    @query(".rippleable")
    public declare rippleable: HTMLElement;

    // @ts-expect-error
    public get noRipple(): boolean
    {
        return this.outlined;
    }

    @attribute(Boolean)
    public counter: boolean = false;

    @attribute(Boolean)
    public filled: boolean = false;

    @attribute
    public hint: string = "";

    @attribute(Boolean)
    public inline: boolean = false;

    @attribute
    public label: string = "";

    @attribute(Number)
    public maxLenght: number = 0;

    @attribute(Boolean)
    public outlined: boolean = false;

    @attribute(Boolean)
    public persistentHint: boolean = false;

    @attribute
    public placeholder: string = "";

    @attribute(Boolean)
    public singleLine: boolean = false;

    @attribute
    public value: string = "";

    public active: boolean = false;

    public get selectionEnd(): number
    {
        return this._selectionEnd;
    }

    public get selectionStart(): number
    {
        return this._selectionStart;
    }

    @computed("active", "counter", "inline", "filled", "label", "outlined", "persistentHint", "placeholder", "singleLine", "value")
    public get classes(): Record<string, boolean>
    {
        return {
            "active":             this.active,
            "active-counter":     this.counter,
            "active-hint":        !!this.hint && (this.active || this.persistentHint),
            "active-label":       !!this.label && (this.active || !!this.value || !!this.placeholder),
            "active-placeholder": !!this.placeholder && !this.value,
            "active-value":       !!this.value,
            "filled":             this.filled,
            "inline":             this.inline,
            "outlined":           this.outlined,
            "single-line":        this.singleLine,
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
        const selection = window.getSelection();

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
            const selection = window.getSelection();

            assert(selection);

            selection.setBaseAndExtent(this.input.firstChild, start, this.input.firstChild, end);

            this._selectionStart = start;
            this._selectionEnd   = end;
        }
    }
}
