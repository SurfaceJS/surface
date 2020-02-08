import { Constructor }       from "@surface/core";
import CustomElement         from "@surface/custom-element";
import { attribute, styles } from "@surface/custom-element/decorators";
import style                 from "./index.scss";

// tslint:disable:no-any
export default <T extends Constructor<CustomElement>>(superClass: T) =>
{
    @styles(style)
    class Disableable extends superClass
    {
        @attribute
        public disabled: boolean = false;
    }

    return Disableable;
};