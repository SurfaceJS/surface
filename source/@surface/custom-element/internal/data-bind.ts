import { Indexer }          from "@surface/core";
import { getKeyMember }     from "@surface/core/common/object";
import Reactive             from "@surface/reactive";
import IPropertyListener    from "@surface/reactive/interfaces/property-listener";
import PropertyListener     from "@surface/reactive/property-listener";
import PropertySubscription from "@surface/reactive/property-subscription";
import IListener            from "../../reactive/interfaces/listener";
import IReactor             from "../../reactive/interfaces/reactor";
import ISubscription        from "../../reactive/interfaces/subscription";
import { pushSubscription } from "./common";
import Metadata             from "./metadata/metadata";

export default class DataBind
{
    public static oneWay(target: object, path: string|Array<string>, listener: IListener|IPropertyListener, lazy?: boolean): [IReactor, ISubscription]
    {
        const [key, member]                     = getKeyMember(target, path);
        const [reactor, observer, subscription] = lazy ? Reactive.observe(target, path) : Reactive.observe(target, path, listener);
        const subscriptions                     = [] as Array<ISubscription>;

        const metadata = Metadata.from(member);

        if ((member instanceof HTMLElement && (member.contentEditable == "true" || member.nodeName == "INPUT")) && !metadata.hasListener)
        {
            type Key = keyof HTMLElement;

            const action = function (this: HTMLElement)
            {
                observer.notify(this[key as Key]);
            };

            member.addEventListener("input", action);

            const subscription =
            {
                unsubscribe: () =>
                {
                    member.removeEventListener("input", action);

                    metadata.hasListener = false;
                }
            };

            subscriptions.push(subscription);

            metadata.hasListener = true;
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

    public static twoWay(left: object, leftPath: string, right: object, rightPath: string): void
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

    public static unbind(target: object): void
    {
        const metadata = Metadata.from(target);

        metadata.subscriptions.forEach(x => x.unsubscribe());
        metadata.subscriptions = [];
    }
}