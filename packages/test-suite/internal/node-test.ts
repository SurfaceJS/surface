
import { after, afterEach, before, beforeEach, describe, it } from "node:test";

type Delegate = (...args: unknown[]) => unknown;

interface ITestOptions
{
    timeout?: number,
}

type TestHandle = Delegate &
{
    (title: string, callback: Delegate): void;
    (title: string, callback: Delegate, options: ITestOptions): void;
};

const nodeTest =
{
    after:      after as TestHandle,
    afterEach:  afterEach as TestHandle,
    before:     before as TestHandle,
    beforeEach: beforeEach as TestHandle,
    suite:      describe as unknown as TestHandle,
    test:       it as TestHandle,
    it:         it as TestHandle,
};

export { afterEach, beforeEach, describe, it };

export default nodeTest;
