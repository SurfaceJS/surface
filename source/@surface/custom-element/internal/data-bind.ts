import { Indexer }                       from "@surface/core";
import { getKeyMember }                  from "@surface/core/common/object";
import Reactive                          from "@surface/reactive";
import IPropertyListener                 from "@surface/reactive/interfaces/property-listener";
import PropertyListener                  from "@surface/reactive/property-listener";
import PropertySubscription              from "@surface/reactive/property-subscription";
import IListener                         from "../../reactive/interfaces/listener";
import IReactor                          from "../../reactive/interfaces/reactor";
import ISubscription                     from "../../reactive/interfaces/subscription";
import { pushSubscription }              from "./common";
import { LISTENNING, SUBSCRIPTIONS }     from "./symbols";
import { ElementSubscriber, Subscriber } from "./types";

export default class DataBind
{
    public static oneWay(target: Subscriber, path: string|Array<string>, listener: IListener|IPropertyListener, lazy?: boolean): [IReactor, ISubscription]
    {
        const [key, member]                     = getKeyMember(target, path);
        const [reactor, observer, subscription] = lazy ? Reactive.observe(target, path) : Reactive.observe(target, path, listener);
        const subscriptions                     = [] as Array<ISubscription>;

        if (member instanceof HTMLInputElement && !(member as ElementSubscriber)[LISTENNING])
        {
            type Key = keyof HTMLInputElement;

            const action = function (this: HTMLInputElement)
            {
                observer.notify(this[key as Key]);
            };

            member.addEventListener("input", action);

            const subscription =
            {
                unsubscribe: () =>
                {
                    member.removeEventListener("input", action);

                    (member as ElementSubscriber)[LISTENNING] = false;
                }
            };

            subscriptions.push(subscription);

            (member as ElementSubscriber)[LISTENNING] = true;
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
            subscriptions.push(subscription ?? observer.subscribe(listener));

            subscriptionsHandler = { unsubscribe: () => subscriptions.forEach(x => x.unsubscribe()) };
        }

        return [reactor, subscriptionsHandler];
    }

    public static twoWay(left: Subscriber, leftPath: string, right: Subscriber, rightPath: string): void
    {
        const [leftKey,  leftMember]  = getKeyMember(left, leftPath);
        const [rightKey, rightMember] = getKeyMember(right, rightPath);

        const leftListener  = new PropertyListener(rightMember as Indexer, rightKey);
        const rightListener = new PropertyListener(leftMember as Indexer, leftKey);

        const [leftReactor,  leftSubscription]  = DataBind.oneWay(left, leftPath, leftListener, false);
        const [rightReactor, rightSubscription] = DataBind.oneWay(right, rightPath, rightListener, false);

        if ("update" in rightSubscription)
        {
            leftReactor.setPropertySubscription(leftKey, rightSubscription);
        }

        if ("update" in leftSubscription)
        {
            rightReactor.setPropertySubscription(rightKey, leftSubscription);
        }

        pushSubscription(left, rightSubscription);
        pushSubscription(right, leftSubscription);
    }

    public static unbind(target: Subscriber): void
    {
        const subscriptions = target[SUBSCRIPTIONS];

        if (subscriptions)
        {
            subscriptions.forEach(x => x.unsubscribe());

            target[SUBSCRIPTIONS] = [];
        }
    }
}