import type TestMethod from "./test-method";

type TestObject<T = unknown> = { [key: string]: TestMethod<T> };

export default TestObject;