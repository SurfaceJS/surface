import type { Constructor } from "@surface/core";
import type CustomElement   from "@surface/custom-element";
import { attribute }        from "@surface/custom-element";
import { computed }         from "@surface/reactive";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const themeable = <T extends Constructor<CustomElement>>(superClass: T) =>
{
    class Themeable extends superClass
    {
        @attribute
        public dark: boolean = false;

        @attribute
        public light: boolean = false;

        @computed("dark", "light")
        public get themeClasses(): Record<string, boolean>
        {
            return { dark: this.dark, light: this.light };
        }
    }

    return Themeable;
};

export default themeable;