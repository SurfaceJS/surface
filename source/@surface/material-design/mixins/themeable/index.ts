import { Constructor }       from "@surface/core";
import CustomElement         from "@surface/custom-element";
import { attribute, notify } from "@surface/custom-element/decorators";

// tslint:disable:no-any
export default <T extends Constructor<CustomElement>>(superClass: T) =>
{
    class Themeable extends superClass
    {
        @attribute
        @notify("themeClasses")
        public dark: boolean = false;

        @attribute
        @notify("themeClasses")
        public light: boolean = false;

        public get themeClasses(): Record<string, boolean>
        {
            return { dark: this.dark, light: this.light };
        }
    }

    return Themeable;
};