import type { Constructor }    from "@surface/core";
import type CustomElement      from "@surface/custom-element";
import { attribute, computed } from "@surface/custom-element";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const themeable = <T extends Constructor<CustomElement>>(superClass: T): Constructor<IThemeable> & T =>
{
    class Themeable extends superClass
    {
        @attribute(Boolean)
        public dark: boolean = false;

        @attribute(Boolean)
        public light: boolean = false;

        @computed("dark", "light")
        public get themeClasses(): Record<string, boolean>
        {
            return { dark: this.dark, light: this.light };
        }
    }

    return Themeable;
};

export interface IThemeable
{
    dark:         boolean;
    light:        boolean;
    themeClasses: Record<string, boolean>;
}

export default themeable;