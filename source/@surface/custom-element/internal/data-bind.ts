import { Action1 }  from "@surface/core";
import Observer     from "@surface/observer";
import IObservable  from "@surface/observer/interfaces/observable";
import PropertyInfo from "@surface/reflection/property-info";

const HOOKS = Symbol("data-bind:hooks");
type Hookable = IObservable & { [HOOKS]?: Array<string|symbol> };

export default class DataBind
{
    public static oneWay(target: Hookable, property: PropertyInfo, action: Action1<IObservable>): void
    {
        const hooks = target[HOOKS] || [];

        const observer = Observer.observe(target, property.key as keyof Hookable);

        observer.subscribe(action as Action1<unknown>);

        if (!hooks.includes(property.key))
        {
            Observer.inject(target, property, observer);

            if (target instanceof HTMLElement)
            {
                const setAttribute = target.setAttribute;

                target.setAttribute = function (qualifiedName: string, value: string)
                {
                    setAttribute.call(this, qualifiedName, value);

                    if (qualifiedName == property.key)
                    {
                        observer.notify(this);
                    }
                };

                if (target instanceof HTMLInputElement)
                {
                    target.addEventListener("change", function () { observer.notify(this); });
                    target.addEventListener("keyup",  function () { observer.notify(this); });
                }
            }

            hooks.push(property.key);

            target[HOOKS] = hooks;
        }
    }

    public static twoWay(left: IObservable, leftProperty: PropertyInfo, right: IObservable, rightProperty: PropertyInfo): void
    {
        const leftKey  = leftProperty.key  as keyof IObservable;
        const rightKey = rightProperty.key as keyof IObservable;

        DataBind.oneWay(left,  leftProperty,  source => right[rightKey] = source[leftKey]);
        DataBind.oneWay(right, rightProperty, source => left[leftKey]   = source[rightKey]);
    }
}