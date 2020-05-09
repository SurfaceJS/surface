export default class TemplateParseError extends Error
{
    public constructor(message: string, stack: string)
    {
        super(message);

        this.stack = stack;
    }
}