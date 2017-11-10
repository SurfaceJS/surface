import { ObjectLiteral, Nullable } from '@surface/types';

//import { ObjectLiteral } from '@surface/types';

export class Route
{
    private _expression: RegExp
    public get expression(): RegExp
    {
        return this._expression;
    }

    private _isDefault: boolean
    public get isDefault(): boolean
    {
        return this._isDefault;
    }
    
    private _pattern: string
    public get pattern(): string
    {
        return this._pattern;
    }

    public constructor(pattern: string);
    public constructor(pattern: string, isDefault: boolean);
    public constructor(pattern: string, isDefault?: boolean)
    {
        this._pattern = pattern;

        this._expression = this.toExpression(pattern);
    }

    public match(route: string): Nullable<Route.Match>
    {
        let [path, search] = route.split('?');

        let params: ObjectLiteral<string> = { };

        if (this._expression.test(route))
        {
            let keys   = this._expression.exec(this._pattern);
            let values = this._expression.exec(path);

            if (keys && values)
            {
                Array.from(keys).asEnumerable()
                    .zip(Array.from(values), (key, value) => ({ key, value }))
                    .forEach(x => params[x.key] = x.value);
            }

            return { match: this.pattern, route, params, search };
        }

        return null;
    }

    private toExpression(pattern: string): RegExp
    {        
        let expression = pattern.replace(/^\/|\/$/g, '').split('/').asEnumerable()
            .select(x => x.replace(/{\s*([^}\s\?=]+)\s*}/g, '([^\\\/]+?)').replace(/{\s*([^}=?\s]+)\s*=\s*([^}=?\s]+)\s*}|{\s*([^} ?]+\?)?\s*}|(\s*\*\s*)/, '([^\\\/]*?)'))
            .toArray()
            .join('\\\/');

        expression = expression.replace(/(\(\[\^\\\/\]\*\?\))(\\\/)/g, '$1\\\/?');

        return new RegExp(`^\/?${expression}\/?$`);
    }
}

export namespace Route
{
    export interface Match
    {
        match:  string;
        params: ObjectLiteral<string>;
        route:  string;
        search: string;
    }
}