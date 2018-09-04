import { Action }   from "@surface/core";
import { observe }  from "@surface/observer/common";
import IObservable  from "@surface/observer/interfaces/observable";
import { NOTIFIER } from "@surface/observer/symbols";
import PropertyInfo from "@surface/reflection/property-info";

export default class DataBind
{
    public static oneWay(target: object, property: PropertyInfo, action: Action): void;
    public static oneWay(target: IObservable, property: PropertyInfo, action: Action): void;
    public static oneWay(target: IObservable, property: PropertyInfo, action: Action): void
    {
        const observer = observe(target, property.key);

        observer.subscribe(action);

        Object.defineProperty
        (
            target,
            property.key,
            {
                configurable: true,
                get: () => property.getter && property.getter.call(target),
                set: (value: Object) =>
                {
                    if (!target[NOTIFIER] && property.setter)
                    {
                        property.setter.call(target, value);

                        target[NOTIFIER] = true;

                        observer.notify();

                        target[NOTIFIER] = false;
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
                    observer.notify();
                }
            };

            if (target instanceof HTMLInputElement)
            {
                target.addEventListener("change", () => observer.notify());
                target.addEventListener("keyup", () => observer.notify());
            }
        }
    }

    public static twoWay(left: object, leftProperty: PropertyInfo, right: object, rightProperty: PropertyInfo): void;
    public static twoWay(left: IObservable, leftProperty: PropertyInfo, right: IObservable, rightProperty: PropertyInfo): void;
    public static twoWay(left: IObservable, leftProperty: PropertyInfo, right: IObservable, rightProperty: PropertyInfo): void
    {
        const rightKey = rightProperty.key as keyof IObservable;
        const leftKey  = rightProperty.key as keyof IObservable;

        DataBind.oneWay(left,  leftProperty,  () => right[rightKey] = left[leftKey]);
        DataBind.oneWay(right, rightProperty, () => left[leftKey]   = right[rightKey]);
    }
}