import Type       from "@surface/reflection";
import { Action } from "@surface/types";

const onbinding = Symbol("data-bind:onbinding");

export default class DataBind
{
    public static oneWay(target: Object, key: string, action: Action): void
    {
        const property = Type.from(target).getProperty(key);

        if (!property)
        {
            throw new Error(`Property ${key} does not exists on target object`);
        }
        Object.defineProperty
        (
            target,
            key,
            {
                configurable: true,
                get: () => property.getter && property.getter.call(target),
                set: (value: Object) =>
                {
                    if (property.setter)
                    {
                        target[onbinding] = true;

                        property.setter.call(target, value);

                        action();

                        target[onbinding] = false;
                    }
                }
            }
        );

        if (target instanceof HTMLElement)
        {
            const setAttribute = target.setAttribute;

            target.setAttribute = function (qualifiedName: string, value: string)
            {
                if (!target[onbinding] && qualifiedName == key)
                {
                    target[key] = value;
                }

                setAttribute.call(this, qualifiedName, value);
            };

            target.addEventListener("change", action);
        }
    }

    public static twoWay(left: Object, leftKey: string, right: Object, rightKey: string): void
    {
        const leftProperty  = Type.from(left).getProperty(leftKey);
        const rightProperty = Type.from(right).getProperty(rightKey);

        DataBind.oneWay(left,  leftKey,  () => rightProperty && rightProperty.setter && rightProperty.setter.call(right, left[leftKey]));
        DataBind.oneWay(right, rightKey, () => leftProperty  && leftProperty.setter  && leftProperty.setter.call(left, right[rightKey]));
    }
}