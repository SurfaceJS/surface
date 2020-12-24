import type { Constructor }  from "@surface/core";
import type CustomElement    from "@surface/custom-element";
import { attribute, styles } from "@surface/custom-element";
import style                 from "./index.scss";

/* eslint-disable @typescript-eslint/explicit-function-return-type */
const disableable = <T extends Constructor<CustomElement>>(superClass: T) =>
{
    @styles(style)
    class Disableable extends superClass
    {
        @attribute
        public disabled: boolean = false;
    }

    return Disableable;
};

export default disableable;