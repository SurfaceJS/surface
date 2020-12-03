export default class TaskCanceledError extends Error
{
    public constructor(message: string = "Task was canceled")
    {
        super(message);
    }
}