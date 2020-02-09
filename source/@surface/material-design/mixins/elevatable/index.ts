import { Constructor }                     from "@surface/core";
import CustomElement                       from "@surface/custom-element";
import { attribute, computed, styles } from "@surface/custom-element/decorators";
import style                               from "./index.scss";

// tslint:disable:no-any
export default <T extends Constructor<CustomElement>>(superClass: T) =>
{
    @styles(style)
    class Elevatable extends superClass
    {
        @attribute
        public elevation: number = 0;

        @computed("elevation")
        public get elevationClasses(): Record<string, boolean>
        {
            return { [`elevation-${this.elevation}`]: this.elevation > -1 && this.elevation < 25 };
        }
    }

    return Elevatable;
};