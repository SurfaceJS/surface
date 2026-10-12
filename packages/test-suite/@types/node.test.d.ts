declare module "node:test"
{
    type Delegate = (...args: unknown[]) => void | Promise<void>;
    interface TestOptions
    {
        timeout?: number,
    }
    export function describe(title: string, callback: Delegate): void;
    export function it(title: string, callback: Delegate): void;
    export function it(title: string, callback: Delegate, options: TestOptions): void;
    export function test(title: string, callback: Delegate): void;
    export function test(title: string, callback: Delegate, options: TestOptions): void;
    export function before(callback: Delegate): void;
    export function before(title: string, callback: Delegate): void;
    export function after(callback: Delegate): void;
    export function after(title: string, callback: Delegate): void;
    export function beforeEach(callback: Delegate): void;
    export function beforeEach(title: string, callback: Delegate): void;
    export function afterEach(callback: Delegate): void;
    export function afterEach(title: string, callback: Delegate): void;
}
