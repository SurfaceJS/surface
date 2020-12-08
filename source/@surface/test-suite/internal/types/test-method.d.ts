import type { Delegate } from "@surface/core";
import
{
    AFTER,
    AFTER_EACH,
    BATCH,
    BEFORE,
    BEFORE_EACH,
    CATEGORY,
    DATA,
    DESCRIPTION,
    EXPECTATION,
    TEST,
} from "../symbols.js";

type TestMethod<T = unknown> = Function &
{
    [AFTER]?:       boolean,
    [AFTER_EACH]?:  boolean,
    [BEFORE]?:      boolean,
    [BEFORE_EACH]?: boolean,
    [BATCH]?:       boolean,
    [CATEGORY]?:    string,
    [DATA]?:        { source: T[], expectation: Delegate<[T], string> },
    [DESCRIPTION]?: string,
    [EXPECTATION]?: string,
    [TEST]?:        boolean,
};

export default TestMethod;
