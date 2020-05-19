export default class CustomStackError extends Error
{
    public constructor(message: string, stack: string)
    {
        super(message);

        this.stack = message + "\n" + stack;
    }
}