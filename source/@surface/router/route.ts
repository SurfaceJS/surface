import { ObjectLiteral, Nullable } from '@surface/types';

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

    private _name: string
    public get name(): string
    {
        return this._name;
    }
    
    private _pattern: string
    public get pattern(): string
    {
        return this._pattern;
    }

    public constructor(name: string, pattern: string);
    public constructor(name: string, pattern: string, isDefault: boolean);
    public constructor(name: string, pattern: string, isDefault?: boolean)
    {
        this._expression = this.toExpression(pattern);
        this._isDefault  = !!isDefault;
        this._name       = name;
        this._pattern    = pattern;
    }

    public match(route: string): Nullable<Route.Data>
    {
        let [path, queryString] = route.split('?');

        let params: ObjectLiteral<string>           = { };
        let search: Nullable<ObjectLiteral<string>> = null;

        if (queryString)
        {
            search = { };
            
            decodeURI(queryString).split('&')
                .asEnumerable()
                .select(x => x.split('='))
                .forEach(x => search && (search[x[0]] = x[1]))
        }

        if (this._expression.test(route))
        {
            let keys = this._expression.exec(this._pattern);
            
            this._expression.lastIndex = 0;
            
            let values = this._expression.exec(path);

            if (keys && values)
            {
                Array.from(keys).asEnumerable()
                    .zip(Array.from(values), (key, value) => ({ key, value }))
                    .skip(1)
                    .forEach
                    (
                        x =>
                        {
                            let match = /{\s*([^=?]+)\??(?:=([^}]*))?\s*}/.exec(x.key);
                            if (match)
                            {
                                params[match[1]] = x.value || match[2];
                            }
                        }
                    );
            }

            return { match: this.pattern, route, params, search };
        }

        return null;
    }

    private toExpression(pattern: string): RegExp
    {        
        let expression = pattern.replace(/^\/|\/$/g, '').split('/').asEnumerable()
            .select(x => x.replace(/{\s*([^}\s\?=]+)\s*}/g, '([^\\\/]+)').replace(/{\s*([^}=?\s]+)\s*=\s*([^}=?\s]+)\s*}|{\s*([^} ?]+\?)?\s*}|(\s*\*\s*)/, '([^\\\/]*)'))
            .toArray()
            .join('\\\/');

        expression = expression
            .replace(/(\\\/(?!\?))(\(\[\^\\\/\]\*\))/g, '$1?$2')
            .replace(/(\(\[\^\\\/\]\*\))(\\\/(?!\?))/g, '$1$2?');

        return new RegExp(`^\/?${expression}\/?$`, "i");
    }
}

export namespace Route
{
    export interface Data
    {
        match:  string;
        params: ObjectLiteral<string>;
        route:  string;
        search: Nullable<ObjectLiteral<string>>;
    }
}