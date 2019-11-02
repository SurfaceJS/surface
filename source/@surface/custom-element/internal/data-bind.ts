import { Indexer }          from "@surface/core";
import { getKeyMember }     from "@surface/core/common/object";
import Reactive             from "@surface/reactive";
import IPropertyListener    from "@surface/reactive/interfaces/property-listener";
import PropertyListener     from "@surface/reactive/property-listener";
import PropertySubscription from "@surface/reactive/property-subscription";
import IListener            from "../../reactive/interfaces/listener";
import IReactor             from "../../reactive/interfaces/reactor";
import ISubscription        from "../../reactive/interfaces/subscription";

const SUBSCRIPTIONS = Symbol("data-bind:subscriptions");

type Observable = Indexer & { [SUBSCRIPTIONS]?: Array<ISubscription> };

export default class DataBind
{
    public static oneWay(target: Indexer, path: string, listener: IListener|IPropertyListener): [IReactor, ISubscription]
    {
        const [key, member]                     = getKeyMember(target, path);
        const [reactor, observer, subscription] = Reactive.observe(target, path, listener);
        const subscriptions                     = [] as Array<ISubscription>;

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

        let subscriptionsHandler: ISubscription;

        if ("update" in listener)
        {
            const propertySubscription = new PropertySubscription(listener, observer);

            propertySubscription.onUnsubscribe(() => subscriptions.forEach(x => x.unsubscribe()));

            subscriptionsHandler = propertySubscription;
        }
        else
        {
            subscriptions.push(subscription);

            subscriptionsHandler = { unsubscribe: () => subscriptions.forEach(x => x.unsubscribe()) };
        }

        return [reactor, subscriptionsHandler];
    }

    public static twoWay(left: Observable, leftPath: string, right: Observable, rightPath: string): void
    {
        const [leftKey,  leftMember]  = getKeyMember(left, leftPath);
        const [rightKey, rightMember] = getKeyMember(right, rightPath);

        const leftListener  = new PropertyListener(rightMember, rightKey);
        const rightListener = new PropertyListener(leftMember, leftKey);

        const [leftReactor,  leftSubscription]  = DataBind.oneWay(left, leftPath, leftListener);
        const [rightReactor, rightSubscription] = DataBind.oneWay(right, rightPath, rightListener);

        if ("update" in rightSubscription)
        {
            leftReactor.setPropertySubscription(leftKey, rightSubscription);
        }

        if ("update" in leftSubscription)
        {
            rightReactor.setPropertySubscription(rightKey, leftSubscription);
        }

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