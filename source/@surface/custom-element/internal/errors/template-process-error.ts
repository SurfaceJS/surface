export default class TemplateProcessError extends Error
{
    public constructor(message: string, stack: string)
    {
        super(message);

        this.stack = message + "\n" + stack;
    }
}