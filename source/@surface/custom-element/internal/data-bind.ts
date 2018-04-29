import { Action, Unknown } from "@surface/core";
import Observer            from "@surface/core/observer";
import PropertyInfo        from "@surface/reflection/property-info";

const caller   = Symbol("data-bind:caller");
const observer = Symbol("data-bind:observer");

type Observable =
{
    [key: string]: Unknown,
    [caller]:      boolean,
    [observer]:    Observer
};

export default class DataBind
{
    public static oneWay(target: Object,     property: PropertyInfo, action: Action): void;
    public static oneWay(target: Observable, property: PropertyInfo, action: Action): void
    {
        target[observer] = target[observer] || new Observer();

        target[observer].subscribe(action);

        Object.defineProperty
        (
            target,
            property.key,
            {
                configurable: true,
                get: () => property.getter && property.getter.call(target),
                set: (value: Object) =>
                {
                    if (!target[caller] && property.setter)
                    {
                        property.setter.call(target, value);

                        target[observer].notify();
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
                    target[observer].notify();
                }
            };

            target.addEventListener("change", () => target[observer].notify());
            target.addEventListener("keyup", () => target[observer].notify());
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
                left[caller]             = true;
                right[rightProperty.key] = left[leftProperty.key];
                left[caller]             = false;
            }
        );

        DataBind.oneWay
        (
            right,
            rightProperty,
            () =>
            {
                right[caller]          = true;
                left[leftProperty.key] = right[rightProperty.key];
                right[caller]          = false;
            }
        );
    }
}