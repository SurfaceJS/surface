import { Indexer }          from "@surface/core";
import { getKeyMember }     from "@surface/core/common/object";
import Reactive             from "@surface/reactive";
import IPropertyListener    from "@surface/reactive/interfaces/property-listener";
import PropertyListener     from "@surface/reactive/property-listener";
import PropertySubscription from "@surface/reactive/property-subscription";
import IListener            from "../../reactive/interfaces/listener";
import IReactor             from "../../reactive/interfaces/reactor";
import ISubscription        from "../../reactive/interfaces/subscription";
import Metadata             from "./metadata/metadata";

const PRIMITIVES = [ "boolean", "number", "string"];

export default class DataBind
{
    public static observe(target: Indexer, observables: Array<Array<string>>, listener: IListener, lazy?: boolean): ISubscription
    {
        const subscriptions = observables.map(path => DataBind.oneWay(target, path, listener, lazy).subscription);

        return { unsubscribe: () => subscriptions.forEach(x => x.unsubscribe()) };
    }

    public static oneWay(target: object, path: string|Array<string>, listener: IListener|IPropertyListener, lazy?: boolean): { reactor?: IReactor, subscription: ISubscription }
    {
        const foo = getKeyMember(target, path);
        const { key, member } = foo;

        if (PRIMITIVES.includes(typeof member))
        {
            return { subscription: { unsubscribe: () => null }};
        }

        const { reactor, observer, subscription: _subscription } = Reactive.observe(target, path, listener, lazy);
        const subscriptions                                      = [] as Array<ISubscription>;

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

        let subscription: ISubscription;

        if ("update" in listener)
        {
            const propertySubscription = new PropertySubscription(listener, observer);

            propertySubscription.onUnsubscribe(() => subscriptions.forEach(x => x.unsubscribe()));

            subscription = propertySubscription;
        }
        else
        {
            subscriptions.push(_subscription ?? observer.subscribe(listener));

            subscription = { unsubscribe: () => subscriptions.forEach(x => x.unsubscribe()) };
        }

        return { reactor, subscription };
    }

    public static twoWay(left: object, leftPath: string, right: object, rightPath: string): [ISubscription, ISubscription]
    {
        const { key: leftKey,  member: leftMember  } = getKeyMember(left, leftPath);
        const { key: rightKey, member: rightMember } = getKeyMember(right, rightPath);

        const leftListener  = new PropertyListener(rightMember as Indexer, rightKey);
        const rightListener = new PropertyListener(leftMember as Indexer, leftKey);

        const { reactor: leftReactor,  subscription: leftSubscription }  = DataBind.oneWay(left, leftPath, leftListener);
        const { reactor: rightReactor, subscription: rightSubscription } = DataBind.oneWay(right, rightPath, rightListener);

        if (leftReactor && "update" in rightSubscription)
        {
            leftReactor.setPropertySubscription(leftKey, rightSubscription);
        }

        if (rightReactor && "update" in leftSubscription)
        {
            rightReactor.setPropertySubscription(rightKey, leftSubscription);
        }

        return [leftSubscription, rightSubscription];
    }
}