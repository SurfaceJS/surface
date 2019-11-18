import ISubscription     from "@surface/reactive/interfaces/subscription";
import { SUBSCRIPTIONS } from "./symbols";
import { Subscriber }    from "./types";

export function pushSubscription(target: Subscriber, subscription: ISubscription): void
{
    (target[SUBSCRIPTIONS] = target[SUBSCRIPTIONS] ?? []).push(subscription);
}