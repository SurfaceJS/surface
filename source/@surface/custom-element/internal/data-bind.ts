import { Indexer }       from "@surface/core";
import { getKeyMember }  from "@surface/core/common/object";
import Reactive          from "@surface/reactive";
import IPropertyListener from "@surface/reactive/interfaces/property-listener";
import IListener         from "../../reactive/interfaces/listener";
import ISubscription     from "../../reactive/interfaces/subscription";
import PropertyListener  from "./property-listener";

const HOOKS         = Symbol("data-bind:hooks");
const SUBSCRIPTIONS = Symbol("data-bind:subscriptions");

type Hookable   = Indexer & { [HOOKS]?:         Array<string> };
type Observable = Indexer & { [SUBSCRIPTIONS]?: Array<ISubscription> };

export default class DataBind
{
    public static oneWay(target: Indexer, path: string, listener: IListener|IPropertyListener): ISubscription
    {
        const [key, member] = getKeyMember(target, path) as [string, Hookable];
        const hooks         = member[HOOKS] = member[HOOKS] || [];
        const observer      = Reactive.observe(target, path);
        const subscriptions = [] as Array<ISubscription>;

        subscriptions.push(observer.subscribe(listener));

        observer.notify(member[key]);

        if (!hooks.includes(key) && member instanceof HTMLInputElement)
        {
            type Key = keyof HTMLInputElement;

            const action = function (this: HTMLInputElement)
            {
                observer.notify(this[key as Key]);
            };

            member.addEventListener("change", action);
            member.addEventListener("keyup",  action);

            hooks.push(key);

            const subscription =
            {
                unsubscribe()
                {
                    member.removeEventListener("change", action);
                    member.removeEventListener("keyup",  action);
                }
            };

            subscriptions.push(subscription);
        }

        const subscription = "update" in listener ?
            { update: (target: Indexer) => listener.update(target), unsubscribe: () => subscriptions.forEach(x => x.unsubscribe()) }
            : { unsubscribe: () => subscriptions.forEach(x => x.unsubscribe()) };

        return subscription;
    }

    public static twoWay(left: Observable, leftPath: string, right: Observable, rightPath: string): void
    {
        const [leftKey,  leftMember]  = getKeyMember(left, leftPath);
        const [rightKey, rightMember] = getKeyMember(right, rightPath);

        const leftListener  = new PropertyListener(rightMember, rightKey);
        const rightListener = new PropertyListener(leftMember, leftKey);

        const leftSubscription  = DataBind.oneWay(left, leftPath, leftListener);
        const rightSubscription = DataBind.oneWay(right, rightPath, rightListener);

        const leftReactor  = Reactive.getReactor(left)!;
        const rightReactor = Reactive.getReactor(right)!;

        leftReactor.setSubscription(leftKey, rightSubscription);
        rightReactor.setSubscription(rightKey, leftSubscription);

        const leftSubscriptionQueue = left[SUBSCRIPTIONS] = left[SUBSCRIPTIONS] || [];
        leftSubscriptionQueue.push(leftSubscription);

        const rightSubscriptionQueue = right[SUBSCRIPTIONS] = right[SUBSCRIPTIONS] || [];
        rightSubscriptionQueue.push(rightSubscription);
    }

    public static unbind(target: Observable): void
    {
        const subscriptions = target[SUBSCRIPTIONS];

        if (subscriptions)
        {
            subscriptions.forEach(x => x.unsubscribe());

            target[SUBSCRIPTIONS] = [];
        }
    }
}