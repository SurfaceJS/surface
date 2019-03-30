import { Indexer }       from "@surface/core";
import { getKeyMember }  from "@surface/core/common/object";
import Reactive          from "@surface/reactive";
import IPropertyListener from "@surface/reactive/interfaces/property-listener";
import IListener         from "../../reactive/interfaces/listener";
import IReactor          from "../../reactive/interfaces/reactor";
import ISubscription     from "../../reactive/interfaces/subscription";
import PropertyListener  from "./property-listener";

const SUBSCRIPTIONS = Symbol("data-bind:subscriptions");

type Observable = Indexer & { [SUBSCRIPTIONS]?: Array<ISubscription> };

export default class DataBind
{
    public static oneWay(target: Indexer, path: string, listener: IListener|IPropertyListener): [IReactor, ISubscription]
    {
        const [key, member]                     = getKeyMember(target, path);
        const [reactor, observer, subscription] = Reactive.observe(target, path, listener);
        const subscriptions                     = [] as Array<ISubscription>;

        subscriptions.push(subscription);

        if (member instanceof HTMLInputElement)
        {
            type Key = keyof HTMLInputElement;

            const action = function (this: HTMLInputElement)
            {
                observer.notify(this[key as Key]);
            };

            member.addEventListener("input", action);

            const subscription = { unsubscribe: () => member.removeEventListener("input", action) };

            subscriptions.push(subscription);
        }

        const subscriptionWrapper = "update" in listener ?
            { update: (target: Indexer) => listener.update(target), unsubscribe: () => subscriptions.forEach(x => x.unsubscribe()) }
            : { unsubscribe: () => subscriptions.forEach(x => x.unsubscribe()) };

        return [reactor, subscriptionWrapper];
    }

    public static twoWay(left: Observable, leftPath: string, right: Observable, rightPath: string): void
    {
        const [leftKey,  leftMember]  = getKeyMember(left, leftPath);
        const [rightKey, rightMember] = getKeyMember(right, rightPath);

        const leftListener  = new PropertyListener(rightMember, rightKey);
        const rightListener = new PropertyListener(leftMember, leftKey);

        const [leftReactor,  leftSubscription]  = DataBind.oneWay(left, leftPath, leftListener);
        const [rightReactor, rightSubscription] = DataBind.oneWay(right, rightPath, rightListener);

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