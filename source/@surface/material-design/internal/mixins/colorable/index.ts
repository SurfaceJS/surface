import { Constructor }      from "@surface/core";
import { attribute, query } from "@surface/custom-element/decorators";
import Component            from "../../..";

// tslint:disable:no-any
export default <T extends Constructor<Component>>(superClass: T) =>
{
    class Colorable extends superClass
    {
        private _color:     string = "";
        private _textColor: string = "";

        @query(".colorable", true)
        private readonly colorable!: HTMLElement;

        public get classes(): Record<string, boolean>
        {
            return { ...super.classes, colorable: true };
        }

        public constructor(...args: Array<any>)
        {
            super(...args);
        }

        @attribute
        public get color(): string
        {
            return this._color;
        }

        public set color(value: string)
        {
            this._color = value;
            this.colorable.style.setProperty("--smd-color", value);
        }

        @attribute
        public get textColor(): string
        {
            return this._textColor;
        }

        public set textColor(value: string)
        {
            this._textColor = value;
            this.colorable.style.setProperty("--smd-text-color", value);
        }
    }

    return Colorable;
};