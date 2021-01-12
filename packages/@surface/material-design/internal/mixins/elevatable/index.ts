import type { Constructor }  from "@surface/core";
import type CustomElement    from "@surface/custom-element";
import { attribute, styles } from "@surface/custom-element";
import { computed }          from "@surface/reactive";
import style                 from "./index.scss";

/* eslint-disable @typescript-eslint/explicit-function-return-type */
const elevatable = <T extends Constructor<CustomElement>>(superClass: T) =>
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

export default elevatable;