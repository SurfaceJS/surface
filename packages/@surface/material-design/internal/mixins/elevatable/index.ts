import type { Constructor }            from "@surface/core";
import type CustomElement              from "@surface/custom-element";
import { attribute, computed, styles } from "@surface/custom-element";
import style                           from "./index.scss";

/* eslint-disable @typescript-eslint/explicit-function-return-type */
const elevatable = <T extends Constructor<CustomElement>>(superClass: T): Constructor<IElevatable> & T =>
{
    @styles(style)
    class Elevatable extends superClass implements IElevatable
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

export interface IElevatable
{
    elevation: number;
    elevationClasses: Record<string, boolean>;

}

export default elevatable;