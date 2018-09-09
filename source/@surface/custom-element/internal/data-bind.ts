import { Action }          from "@surface/core";
import { listen, observe } from "@surface/observer/common";
import IObservable         from "@surface/observer/interfaces/observable";
import PropertyInfo        from "@surface/reflection/property-info";

export default class DataBind
{
    public static oneWay(target: IObservable, property: PropertyInfo, action: Action): void
    {
        const observer = observe(target, property.key as keyof IObservable);

        observer.subscribe(action);

        listen(target, property, observer);

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

    public static twoWay(left: IObservable, leftProperty: PropertyInfo, right: IObservable, rightProperty: PropertyInfo): void
    {
        const leftKey  = leftProperty.key  as keyof IObservable;
        const rightKey = rightProperty.key as keyof IObservable;

        DataBind.oneWay(left,  leftProperty,  () => right[rightKey] = left[leftKey]);
        DataBind.oneWay(right, rightProperty, () => left[leftKey]   = right[rightKey]);
    }
}