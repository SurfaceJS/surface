declare module "jsdom/lib/jsdom/living/generated/utils"
{
    export const implSymbol: unique symbol;
}

declare module "jsdom/lib/jsdom/living/nodes/Node-impl"
{
    // tslint:disable-next-line:variable-name
    const Impl: { implementation: { new(args: Array<unknown>, privateData: { ownerDocument: Document }): object } };

    export default Impl;
}