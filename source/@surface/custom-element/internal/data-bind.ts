import { Indexer, getKeyMember } from "@surface/core";
import Reactive,
{
    IListener,
    IPropertyListener,
    IReactor,
    ISubscription,
    PropertyListener,
    PropertySubscription,
} from "@surface/reactive";
import Metadata                  from "./metadata/metadata";

const PRIMITIVES = ["boolean", "number", "string"];

export default class DataBind
{
    public static observe(target: object, observables: string[][], listener: IListener, lazy?: boolean): ISubscription
    {
        const subscriptions = observables.map(path => DataBind.oneWay(target, path, listener, lazy).subscription);

        return { unsubscribe: () => subscriptions.forEach(x => x.unsubscribe()) };
    }

    public static oneWay(target: object, path: string[], listener: IListener | IPropertyListener, lazy?: boolean): { reactor?: IReactor, subscription: ISubscription }
    {
        const { key, member } = getKeyMember(target, path);

        const type = typeof member;

        if (type != "object" && PRIMITIVES.includes(type))
        {
            if (key in member.constructor.prototype)
            {
                return DataBind.oneWay(target, path.slice(0, path.length - 1), listener, lazy);
            }

            throw new Error(`Invalid property path: ${path.join(".")}`);
        }

        const { reactor, observer, subscription: _subscription } = Reactive.observe(target, path, listener, lazy);
        const subscriptions                                      = [] as ISubscription[];

        if (member instanceof HTMLElement && (member.contentEditable == "true" || member.nodeName == "INPUT") && !Metadata.of(member)?.hasListener)
        {
            const metadata = Metadata.from(member);

            type Key = keyof HTMLElement;

            function action(this: HTMLElement): void
            {
                observer.notify(this[key as Key]);
            }

            member.addEventListener("input", action);

            const subscription =
            {
                unsubscribe: () =>
                {
                    member.removeEventListener("input", action);

                    metadata.hasListener = false;
                },
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

        const { reactor: leftReactor,  subscription: leftSubscription }  = DataBind.oneWay(left, [leftPath], leftListener);
        const { reactor: rightReactor, subscription: rightSubscription } = DataBind.oneWay(right, [rightPath], rightListener);

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