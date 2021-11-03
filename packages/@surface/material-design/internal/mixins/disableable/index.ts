import type { Constructor }  from "@surface/core";
import type HTMLXElement     from "@surface/htmlx-element";
import { attribute, styles } from "@surface/htmlx-element";
import style                 from "./index.scss";

/* eslint-disable @typescript-eslint/explicit-function-return-type */
const disableable = <T extends Constructor<HTMLXElement>>(superClass: T): Constructor<IDisableable> & T =>
{
    @styles(style)
    class Disableable extends superClass implements IDisableable
    {
        @attribute(Boolean)
        public disabled: boolean = false;
    }

    return Disableable;
};

export interface IDisableable
{
    disabled: boolean;
}

export default disableable;