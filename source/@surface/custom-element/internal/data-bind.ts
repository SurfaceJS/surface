import { Action, Action1 } from "@surface/core";
import { dashedToCamel }   from "@surface/core/common/string";
import Observer            from "@surface/observer";
import FieldInfo           from "@surface/reflection/field-info";
import MemberInfo          from "@surface/reflection/member-info";

const HOOKS         = Symbol("data-bind:hooks");
const UNSUBSCRIBERS = Symbol("data-bind:unsubscribers");

type Hookable = object & { [HOOKS]?:         Array<string|symbol> };
type Observed = object & { [UNSUBSCRIBERS]?: Observer };

export default class DataBind
{
    public static oneWay(target: Hookable, member: MemberInfo, observed: Observed, action: Action1<unknown>): void
    {
        const hooks = target[HOOKS] = target[HOOKS] || [];

        const observer = Observer.observe(target, member);

        observer.subscribe(action);

        const unsubscribers = observed[UNSUBSCRIBERS] = observed[UNSUBSCRIBERS] || new Observer();

        unsubscribers.subscribe(() => observer.unsubscribe(action));

        if (!hooks.includes(member.key) && member instanceof FieldInfo)
        {
            if (target instanceof HTMLElement)
            {
                const setAttribute = target.setAttribute;

                target.setAttribute = function (qualifiedName: string, value: string)
                {
                    setAttribute.call(this, qualifiedName, value);

                    if (dashedToCamel(qualifiedName) == member.key)
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
        }
    }

    public static twoWay(left: object, leftMember: FieldInfo, right: object, rightMember: FieldInfo, notification :Action): void
    {
        type Key   = keyof object;
        type Value = object[Key];

        const leftKey  = leftMember.key  as Key;
        const rightKey = rightMember.key as Key;

        DataBind.oneWay(left,  leftMember,  right, value => { right[rightKey] = value as Value; });
        DataBind.oneWay(right, rightMember, left,  value => { left[leftKey]   = value as Value; notification(); });
    }

    public static unbind(observed: Observed): void
    {
        const unsubscribers = observed[UNSUBSCRIBERS];

        if (unsubscribers)
        {
            unsubscribers.notify().clear();
        }
    }
}