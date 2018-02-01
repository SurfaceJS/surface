import SyntaxError from "./syntax-error";

export default class ErrorHandler
{
    private readonly _errors: Array<SyntaxError>;
    public get errors(): Array<SyntaxError>
    {
        return this._errors;
    }

    private readonly tolerant: boolean;

    public constructor(tolerant?: boolean)
    {
        this._errors   = [];
        this.tolerant = !!tolerant;
    }

    public recordError(error: SyntaxError): void
    {
        this._errors.push(error);
    }

    public tolerate(error: SyntaxError): void
    {
        if (this.tolerant)
        {
            this.recordError(error);
        }
        else
        {
            throw error;
        }
    }

    public throwError(index: number, line: number, col: number, description: string): never
    {
        throw new SyntaxError(`Line ${line}: ${description}`, index, line, col, description);
    }

    public tolerateError(index: number, line: number, col: number, description: string)
    {
        const error = new SyntaxError(`Line ${line}: ${description}`, index, line, col, description);

        if (this.tolerant)
        {
            this.recordError(error);
        }
        else
        {
            throw error;
        }
    }
}