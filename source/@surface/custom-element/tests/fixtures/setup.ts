import utils       from "jsdom/lib/jsdom/living/generated/utils";
import HTMLElement from "jsdom/lib/jsdom/living/generated/HTMLElement";
import Impl        from "jsdom/lib/jsdom/living/nodes/HTMLUnknownElement-impl";
import { Indexer } from "../../../core";

// tslint:disable-next-line:no-any
export default function setup<T extends Element & { [utils.implSymbol]?: any }>(obj: T, constructorArgs?: Array<unknown>, privateData?: Indexer): T
{
    if (!privateData)
    {
        privateData = { };
    }

    privateData.wrapper = obj;

    HTMLElement._internalSetup(obj);

    Object.defineProperty
    (
        obj,
        utils.implSymbol,
        {
            value: new Impl.implementation(constructorArgs, privateData),
            configurable: true
        }
    );

    obj[utils.implSymbol][utils.wrapperSymbol] = obj;

    if (Impl.init)
    {
        Impl.init(obj[utils.implSymbol], privateData);
    }

    return obj;
}