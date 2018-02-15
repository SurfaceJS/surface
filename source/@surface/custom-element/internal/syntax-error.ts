export default class SyntaxError extends Error
{
    public column:      number;
    public index:       number;
    public lineNumber:  number;

    public constructor(message: string, index: number, lineNumber: number, column: number)
    {
        super(message);

        this.index      = index;
        this.lineNumber = lineNumber;
        this.column     = column;
    }
}