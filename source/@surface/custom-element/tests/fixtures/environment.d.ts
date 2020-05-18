declare module "jsdom/lib/jsdom/living/generated/utils"
{
    export function implForWrapper(obj: object): void;
    export const implSymbol: unique symbol;
    export const wrapperSymbol: unique symbol;

}

declare module "jsdom/lib/jsdom/living/nodes/Node-impl"
{
    // tslint:disable-next-line:variable-name
    const Impl: { implementation: { new(args: Array<unknown>, privateData: { ownerDocument: Document }): object } };

    export default Impl;
}

declare module "jsdom/lib/jsdom/living/generated/HTMLElement"
{
    const _: typeof HTMLElement & { interface: typeof HTMLElement, _internalSetup: <T>(obj: T) => void };

    export default _;
}

declare module "jsdom/lib/jsdom/living/nodes/HTMLUnknownElement-impl";