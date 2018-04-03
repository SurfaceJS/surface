import Type                from "@surface/reflection";
import { Action, Unknown } from "@surface/types";
import Observer            from "@surface/types/observer";

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
    public static oneWay(target: Object, key: string, action: Action): void;
    public static oneWay(target: Observable, key: string, action: Action): void
    {
        const property = Type.from(target).getProperty(key);

        target[observer] = target[observer] || new Observer();

        target[observer].subscribe(action);

        if (property)
        {
            Object.defineProperty
            (
                target,
                key,
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
                    if (qualifiedName == key)
                    {
                        target[observer].notify();
                    }

                    setAttribute.call(this, qualifiedName, value);
                };

                target.addEventListener("change", () => target[observer].notify());
                target.addEventListener("keyup", () => target[observer].notify());
            }
        }
    }

    public static twoWay(left: Object, leftKey: string, right: Object, rightKey: string): void;
    public static twoWay(left: Observable, leftKey: string, right: Observable, rightKey: string): void
    {
        DataBind.oneWay
        (
            left,
            leftKey,
            () =>
                {
                    left[caller]    = true;
                    right[rightKey] = left[leftKey];
                    left[caller]    = false;
                }
        );

        DataBind.oneWay
        (
            right,
            rightKey,
            () =>
                {
                    right[caller] = true;
                    left[leftKey] = right[rightKey];
                    right[caller] = false;
                }
        );
    }
}