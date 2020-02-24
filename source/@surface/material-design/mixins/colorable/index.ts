import { Constructor } from "@surface/core";
import CustomElement   from "@surface/custom-element";
import { attribute }   from "@surface/custom-element/decorators";

const CSS_COLORS_PATTERN = /^(#[a-f0-9]{6}|((rgba?|hsla?)\([^)]*)\))$/i;

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
                this.colorable?.style.setProperty("--this-color", this.getColor(value));
            }
            else
            {
                this.colorable?.style.removeProperty("--this-color");
            }

            this._color = value;
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
                this.colorable?.style.setProperty("--this-text-color", this.getColor(value));
            }
            else
            {
                this.colorable?.style.removeProperty("--this-text-color");
            }

            this._textColor = value;
        }

        private getColor(color: string): string
        {
            return CSS_COLORS_PATTERN.test(color) ? color : `var(--smd-${color})`;
        }
    }

    return Colorable;
};