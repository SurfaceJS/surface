import { Action1 }  from "@surface/core";
import Observer     from "@surface/observer";
import IObservable  from "@surface/observer/interfaces/observable";
import FieldInfo    from "@surface/reflection/field-info";

const HOOKS = Symbol("data-bind:hooks");
type Hookable = IObservable & { [HOOKS]?: Array<string|symbol> };

export default class DataBind
{
    public static oneWay(target: Hookable, property: FieldInfo, action: Action1<unknown>): void
    {
        const hooks = target[HOOKS] || [];

        const observer = Observer.observe(target, property.key as keyof Hookable);

        observer.subscribe(action);

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
                        observer.notify(value);
                    }
                };

                if (target instanceof HTMLInputElement)
                {
                    type Key = keyof HTMLInputElement;

                    target.addEventListener("change", function () { observer.notify(this[property.key as Key]); });
                    target.addEventListener("keyup",  function () { observer.notify(this[property.key as Key]); });
                }
            }

            hooks.push(property.key);

            target[HOOKS] = hooks;
        }
    }

    public static twoWay(left: IObservable, leftProperty: FieldInfo, right: IObservable, rightProperty: FieldInfo): void
    {
        type Key   = keyof IObservable;
        type Value = IObservable[Key];

        const leftKey  = leftProperty.key  as Key;
        const rightKey = rightProperty.key as Key;

        DataBind.oneWay(left,  leftProperty,  value => right[rightKey] = value as Value);
        DataBind.oneWay(right, rightProperty, value => left[leftKey]   = value as Value);
    }
}