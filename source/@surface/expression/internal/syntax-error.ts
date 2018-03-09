export default class SyntaxError extends Error
{
    public column:     number;
    public index:      number;
    public lineNumber: number;

    public constructor(message: string, lineNumber: number, index: number, column: number)
    {
        super(message);

        this.lineNumber = lineNumber;
        this.index      = index;
        this.column     = column;
    }
}