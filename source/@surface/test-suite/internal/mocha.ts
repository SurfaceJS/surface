interface IBeforeAndAfterContext extends IHookCallbackContext
{
    currentTest: ITest;
}

interface IContextDefinition
{
    (description: string, callback: (this: ISuiteCallbackContext) => void): ISuite;
    only(description: string, callback: (this: ISuiteCallbackContext) => void): ISuite;
    skip(description: string, callback: (this: ISuiteCallbackContext) => void): void;
    timeout(ms: number | string): void;
}

interface IHookCallbackContext
{
    skip(): this;
    timeout(ms: number | string): this;
    [index: string]: unknown;
}

interface IRunnable
{
    title: string;
    fn: Function;
    async: boolean;
    sync: boolean;
    timedOut: boolean;
    duration?: number;
    timeout(n: number | string): this;
}

interface ISuite
{
    parent: ISuite;
    title: string;

    fullTitle(): string;
}

interface ISuiteCallbackContext
{
    timeout(ms: number | string): this;
    retries(n: number): this;
    slow(ms: number): this;
}

interface ITest extends IRunnable
{
    parent: ISuite;
    pending: boolean;
    state: "failed" | "passed" | undefined;

    fullTitle(): string;
}

interface ITestCallbackContext
{
    skip(): this;
    timeout(ms: number | string): this;
    retries(n: number): this;
    slow(ms: number): this;
    [index: string]: unknown;
}

interface ITestDefinition
{
    state: "failed" | "passed";
    (expectation: string, callback?: (this: ITestCallbackContext, done: MochaDone) => PromiseLike<unknown> | void): ITest;
    only(expectation: string, callback?: (this: ITestCallbackContext, done: MochaDone) => PromiseLike<unknown> | void): ITest;
    skip(expectation: string, callback?: (this: ITestCallbackContext, done: MochaDone) => PromiseLike<unknown> | void): void;
    timeout(ms: number | string): void;
}

type MochaDone = (error?: unknown) => void;

declare const suite: IContextDefinition;
declare const test:  ITestDefinition;

declare interface IGlobalMocha
{
    after(callback: (this: IHookCallbackContext, done: MochaDone) => PromiseLike<unknown> | void): void;
    after(description: string, callback: (this: IHookCallbackContext, done: MochaDone) => PromiseLike<unknown> | void): void;
    afterEach(callback: (this: IBeforeAndAfterContext, done: MochaDone) => PromiseLike<unknown> | void): void;
    afterEach(description: string, callback: (this: IBeforeAndAfterContext, done: MochaDone) => PromiseLike<unknown> | void): void;
    before(callback: (this: IHookCallbackContext, done: MochaDone) => PromiseLike<unknown> | void): void;
    before(description: string, callback: (this: IHookCallbackContext, done: MochaDone) => PromiseLike<unknown> | void): void;
    beforeEach(callback: (this: IBeforeAndAfterContext, done: MochaDone) => PromiseLike<unknown> | void): void;
    beforeEach(description: string, callback: (this: IBeforeAndAfterContext, done: MochaDone) => PromiseLike<unknown> | void): void;
    setup(callback: (this: IBeforeAndAfterContext, done: MochaDone) => PromiseLike<unknown> | void): void;
    setup(description: string, callback: (this: IBeforeAndAfterContext, done: MochaDone) => PromiseLike<unknown> | void): void;
    suiteSetup(callback: (this: IHookCallbackContext, done: MochaDone) => PromiseLike<unknown> | void): void;
    suiteSetup(description: string, callback: (this: IHookCallbackContext, done: MochaDone) => PromiseLike<unknown> | void): void;
    suiteTeardown(callback: (this: IHookCallbackContext, done: MochaDone) => PromiseLike<unknown> | void): void;
    suiteTeardown(description: string, callback: (this: IHookCallbackContext, done: MochaDone) => PromiseLike<unknown> | void): void;
    teardown(callback: (this: IBeforeAndAfterContext, done: MochaDone) => PromiseLike<unknown> | void): void;
    teardown(description: string, callback: (this: IBeforeAndAfterContext, done: MochaDone) => PromiseLike<unknown> | void): void;
}

declare const global: IGlobalMocha;

// Todo: Implement proper way to wrap mocha
const mocha =
{
    after:      global.after      || global.suiteTeardown,
    afterEach:  global.afterEach  || global.teardown,
    before:     global.before     || global.suiteSetup,
    beforeEach: global.beforeEach || global.setup,
    suite,
    test,
};

export default mocha;