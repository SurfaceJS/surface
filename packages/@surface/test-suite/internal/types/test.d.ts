type Test =
{
    expectation: string,
    getMethod: (context: object) => () => void,
    timeout?: number,
};

export default Test;
