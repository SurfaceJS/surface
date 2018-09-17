import { Action1 }  from "@surface/core";
import Observer     from "@surface/observer";
import IObservable  from "@surface/observer/interfaces/observable";
import FieldInfo    from "@surface/reflection/field-info";
import MemberInfo   from "@surface/reflection/member-info";

const HOOKS         = Symbol("data-bind:hooks");
const UNBIND_ACTION = Symbol("data-bind:unbind-action");

type Hookable   = IObservable & { [HOOKS]?: Array<string|symbol> };
type Observator = object & { [UNBIND_ACTION]?: () => void };

export default class DataBind
{
    public static oneWay(target: Hookable, member: MemberInfo, observator: Observator, action: Action1<unknown>): void
    {
        const hooks = target[HOOKS] || [];

        const observer = Observer.observe(target, member.key as keyof Hookable);

        observer.subscribe(action);

        observator[UNBIND_ACTION] = () => observer.unsubscribe(action);

        if (!hooks.includes(member.key) && member instanceof FieldInfo)
        {
            Observer.inject(target, member, observer);

            if (target instanceof HTMLElement)
            {
                const setAttribute = target.setAttribute;

                target.setAttribute = function (qualifiedName: string, value: string)
                {
                    setAttribute.call(this, qualifiedName, value);

                    if (qualifiedName == member.key)
                    {
                        observer.notify(value);
                    }
                };

                if (target instanceof HTMLInputElement)
                {
                    type Key = keyof HTMLInputElement;

                    target.addEventListener("change", function () { observer.notify(this[member.key as Key]); });
                    target.addEventListener("keyup",  function () { observer.notify(this[member.key as Key]); });
                }
            }

            hooks.push(member.key);

            target[HOOKS] = hooks;
        }
    }

    public static twoWay(left: IObservable, leftProperty: FieldInfo, right: IObservable, rightProperty: FieldInfo): void
    {
        type Key   = keyof IObservable;
        type Value = IObservable[Key];

        const leftKey  = leftProperty.key  as Key;
        const rightKey = rightProperty.key as Key;

        DataBind.oneWay(left,  leftProperty,  right, value => right[rightKey] = value as Value);
        DataBind.oneWay(right, rightProperty, left,  value => left[leftKey]   = value as Value);
    }

    public static unbind(observator: Observator): void
    {
        if (observator[UNBIND_ACTION])
        {
            observator[UNBIND_ACTION]!();
        }
    }
}