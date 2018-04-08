import Type                          from "@surface/reflection";
import FieldInfo                     from "@surface/reflection/field-info";
import MemberInfo                    from "@surface/reflection/member-info";
import PropertyInfo                  from "@surface/reflection/property-info";
import { Action, Nullable, Unknown } from "@surface/types";
import Observer                      from "@surface/types/observer";

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
        let member: Nullable<MemberInfo>;

        if (target instanceof Function)
        {
            const type = Type.of(target);
            member = type.getStaticProperty(key) || type.getStaticField(key);
        }
        else
        {
            const type = Type.from(target);
            member = type.getProperty(key) || type.getField(key);
        }

        target[observer] = target[observer] || new Observer();

        target[observer].subscribe(action);

        if (member instanceof PropertyInfo)
        {
            const property = member;

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
                    setAttribute.call(this, qualifiedName, value);

                    if (qualifiedName == key)
                    {
                        target[observer].notify();
                    }
                };

                target.addEventListener("change", () => target[observer].notify());
                target.addEventListener("keyup", () => target[observer].notify());
            }
        }
        else if (member instanceof FieldInfo)
        {
            target[observer].notify();
        }
        else
        {
            throw new Error(`Property ${key} does not exist on ${target instanceof Function ? target.name : target.constructor.name} type`);
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