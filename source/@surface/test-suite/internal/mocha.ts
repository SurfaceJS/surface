interface IBeforeAndAfterContext extends IHookCallbackContext
{
    currentTest: ITest;
}

interface IContextDefinition
{
    (description: string, callback: (this: ISuiteCallbackContext) => void): ISuite;
    only(description: string, callback: (this: ISuiteCallbackContext) => void): ISuite;
    skip(description: string, callback: (this: ISuiteCallbackContext) => void): void;
    timeout(ms: number|string): void;
}

interface IHookCallbackContext
{
    skip(): this;
    timeout(ms: number|string): this;
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
    timeout(n: number|string): this;
}

interface ISuite
{
    parent: ISuite;
    title: string;

    fullTitle(): string;
}

interface ISuiteCallbackContext
{
    timeout(ms: number|string): this;
    retries(n: number): this;
    slow(ms: number): this;
}

interface ITest extends IRunnable
{
    parent: ISuite;
    pending: boolean;
    state: "failed"|"passed"|undefined;

    fullTitle(): string;
}

interface ITestCallbackContext
{
    skip(): this;
    timeout(ms: number|string): this;
    retries(n: number): this;
    slow(ms: number): this;
    [index: string]: unknown;
}

interface ITestDefinition
{
    state: "failed"|"passed";
    (expectation: string, callback?: (this: ITestCallbackContext, done: MochaDone) => PromiseLike<unknown>|void): ITest;
    only(expectation: string, callback?: (this: ITestCallbackContext, done: MochaDone) => PromiseLike<unknown>|void): ITest;
    skip(expectation: string, callback?: (this: ITestCallbackContext, done: MochaDone) => PromiseLike<unknown>|void): void;
    timeout(ms: number|string): void;
}

type MochaDone = (error?: unknown) => void;

declare const suite: IContextDefinition;
declare const test:  ITestDefinition;

declare function after(callback: (this: IHookCallbackContext, done: MochaDone) => PromiseLike<unknown>|void): void;
declare function after(description: string, callback: (this: IHookCallbackContext, done: MochaDone) => PromiseLike<unknown>|void): void;
declare function afterEach(callback: (this: IBeforeAndAfterContext, done: MochaDone) => PromiseLike<unknown>|void): void;
declare function afterEach(description: string, callback: (this: IBeforeAndAfterContext, done: MochaDone) => PromiseLike<unknown>|void): void;
declare function before(callback: (this: IHookCallbackContext, done: MochaDone) => PromiseLike<unknown>|void): void;
declare function before(description: string, callback: (this: IHookCallbackContext, done: MochaDone) => PromiseLike<unknown>|void): void;
declare function beforeEach(callback: (this: IBeforeAndAfterContext, done: MochaDone) => PromiseLike<unknown>|void): void;
declare function beforeEach(description: string, callback: (this: IBeforeAndAfterContext, done: MochaDone) => PromiseLike<unknown>|void): void;

const mocha = { after, afterEach, before, beforeEach, suite, test };

export default mocha;