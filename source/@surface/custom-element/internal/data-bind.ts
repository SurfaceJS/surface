export default class DataBind
{
    public static apply(left: Object, leftKey: string, right: Object, rightKey: string)
    {
        const leftDescriptor  = Object.getOwnPropertyDescriptor(left, leftKey);
        const rightDescriptor = Object.getOwnPropertyDescriptor(left, leftKey);

        if (!leftDescriptor)
        {
            throw new Error(`Property ${leftKey} does not exists on left hand object`);
        }

        if (!rightDescriptor)
        {
            throw new Error(`Property ${rightKey} does not exists on right hand object`);
        }

        Object.defineProperty
        (
            left,
            leftKey,
            {
                configurable: true,
                get: () => leftDescriptor.get && leftDescriptor.get.call(right),
                set: (value: Object) =>
                {
                    if (leftDescriptor.set)
                    {
                        leftDescriptor.set.call(left, value);

                        if (rightDescriptor.set)
                        {
                            rightDescriptor.set.call(right, value);
                        }
                    }
                }
            }
        );

        Object.defineProperty
        (
            right,
            rightKey,
            {
                configurable: true,
                get: () => rightDescriptor.get && rightDescriptor.get.call(right),
                set: (value: Object) =>
                {
                    if (rightDescriptor.set)
                    {
                        rightDescriptor.set.call(right, value);

                        if (leftDescriptor.set)
                        {
                            leftDescriptor.set.call(left, value);
                        }
                    }
                }
            }
        );
    }
}