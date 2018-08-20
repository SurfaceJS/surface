import { Action }   from "@surface/core";
import Observer     from "@surface/core/observer";
import PropertyInfo from "@surface/reflection/property-info";

const CALLER   = Symbol("data-bind:caller");
const OBSERVER = Symbol("data-bind:observer");

type Observable =
{
    [key: string]: unknown,
    [CALLER]:      boolean,
    [OBSERVER]:    Observer
};

export default class DataBind
{
    public static oneWay(target: Object,     property: PropertyInfo, action: Action): void;
    public static oneWay(target: Observable, property: PropertyInfo, action: Action): void
    {
        target[OBSERVER] = target[OBSERVER] || new Observer();

        target[OBSERVER].subscribe(action);

        Object.defineProperty
        (
            target,
            property.key,
            {
                configurable: true,
                get: () => property.getter && property.getter.call(target),
                set: (value: Object) =>
                {
                    if (!target[CALLER] && property.setter)
                    {
                        property.setter.call(target, value);

                        target[OBSERVER].notify();
                    }
                }
            }
        );

        if (target instanceof HTMLElement)
        {
            const setAttribute = target.setAttribute;

            target.setAttribute = function (qualifiedName: string, value: string)
            {
                setAttribute.call(this, qualifiedName, value);

                if (qualifiedName == property.key)
                {
                    target[OBSERVER].notify();
                }
            };

            if (target instanceof HTMLInputElement)
            {
                target.addEventListener("change", () => target[OBSERVER].notify());
                target.addEventListener("keyup", () => target[OBSERVER].notify());
            }
        }
    }

    public static twoWay(left: Object,     leftProperty: PropertyInfo, right: Object,     rightProperty: PropertyInfo): void;
    public static twoWay(left: Observable, leftProperty: PropertyInfo, right: Observable, rightProperty: PropertyInfo): void
    {
        DataBind.oneWay
        (
            left,
            leftProperty,
            () =>
            {
                left[CALLER]             = true;
                right[rightProperty.key] = left[leftProperty.key];
                left[CALLER]             = false;
            }
        );

        DataBind.oneWay
        (
            right,
            rightProperty,
            () =>
            {
                right[CALLER]          = true;
                left[leftProperty.key] = right[rightProperty.key];
                right[CALLER]          = false;
            }
        );
    }
}