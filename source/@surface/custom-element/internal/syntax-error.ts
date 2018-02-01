export default class SyntaxError extends Error
{
    public column:      number;
    public description: string;
    public index:       number;
    public lineNumber:  number;

    public constructor(message: string, index: number, lineNumber: number, column: number, description: string)
    {
        super(message);

        this.index       = index;
        this.lineNumber  = lineNumber;
        this.column      = column;
        this.description = description;
    }
}
