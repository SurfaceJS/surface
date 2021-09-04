// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Evaluator<T = unknown> = (scope: any) => T;

export default Evaluator;