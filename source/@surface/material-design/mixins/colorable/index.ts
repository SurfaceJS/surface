import { Constructor } from "@surface/core";
import CustomElement   from "@surface/custom-element";
import { attribute }   from "@surface/custom-element/decorators";
import MaterialDesign  from "../..";

const CSS_COLORS_PATTERN = /^(#[a-f0-9]{6}|((rgb|hsl)\([^)]*)\))$/i;

// tslint:disable:no-any
export default <T extends Constructor<CustomElement>>(superClass: T) =>
{
    abstract class Colorable extends superClass
    {
        private _color:     string = "";
        private _textColor: string = "";

        protected abstract readonly colorable?: HTMLElement;

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
            if (value)
            {
                this._color = this.getColor(value);

                this.colorable?.style.setProperty("--this-color", this._color);
            }
            else
            {
                this._color = value;

                this.colorable?.style.removeProperty("--this-color");
            }
        }

        @attribute
        public get textColor(): string
        {
            return this._textColor;
        }

        public set textColor(value: string)
        {
            if (value)
            {
                this._textColor = this.getColor(value);

                this.colorable?.style.setProperty("--this-text-color", this._textColor);
            }
            else
            {
                this._textColor = value;

                this.colorable?.style.removeProperty("--this-text-color");
            }
        }

        private getColor(color: string): string
        {
            return CSS_COLORS_PATTERN.test(color) ? color : MaterialDesign.getColor(color);
        }
    }

    return Colorable;
};