declare interface IGlobalMocha
{
    after(name: string, callback: Function): void;
    afterEach(name: string, callback: Function): void;
    before(name: string, callback: Function): void;
    beforeEach(name: string, callback: Function): void;
    describe(title: string, callback: Function): void;
    it(title: string, callback: Function): void;
    setup(name: string, callback: Function): void;
    suite(title: string, callback: Function): void;
    suiteSetup(name: string, callback: Function): void;
    suiteTeardown(name: string, callback: Function): void;
    teardown(name: string, callback: Function): void;
    test(title: string, callback: Function): void;
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