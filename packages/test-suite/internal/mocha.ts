type Runnable =
{
    timeout(milliseconds: number): void,
};

declare interface IGlobalMocha
{
    after(name: string, callback: Function): Runnable;
    afterEach(name: string, callback: Function): Runnable;
    before(name: string, callback: Function): Runnable;
    beforeEach(name: string, callback: Function): Runnable;
    describe(title: string, callback: Function): Runnable;
    it(title: string, callback: Function): Runnable;
    setup(name: string, callback: Function): Runnable;
    suite(title: string, callback: Function): Runnable;
    suiteSetup(name: string, callback: Function): Runnable;
    suiteTeardown(name: string, callback: Function): Runnable;
    teardown(name: string, callback: Function): Runnable;
    test(title: string, callback: Function): Runnable;
}

declare const global: IGlobalMocha;

const mocha =
{
    after:      global.after      ?? global.suiteTeardown,
    afterEach:  global.afterEach  ?? global.teardown,
    before:     global.before     ?? global.suiteSetup,
    beforeEach: global.beforeEach ?? global.setup,
    suite:      global.describe   ?? global.suite,
    test:       global.it         ?? global.test,
};

export default mocha;
