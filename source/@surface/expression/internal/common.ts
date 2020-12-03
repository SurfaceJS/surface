import IPattern  from "./interfaces/pattern";
import TypeGuard from "./type-guard";
import Token     from "./types/token";

export function hasDuplicated(parameters: IPattern[]): boolean;
export function hasDuplicated(parameters: IPattern[], lookeaheads: Token[]): { result: true, token: Token } | { result: false, token: null };
export function hasDuplicated(parameters: IPattern[], lookeaheads?: Token[]): boolean | { result: boolean, token: Token | null }
{
    const cache = new Set<string>();

    const isDuplicated = (pattern: IPattern): boolean =>
    {
        if (TypeGuard.isIdentifier(pattern))
        {
            if (cache.has(pattern.name))
            {
                return true;
            }

            cache.add(pattern.name);

        }
        else if (TypeGuard.isAssignmentPattern(pattern))
        {
            return isDuplicated(pattern.left);
        }
        else if (TypeGuard.isArrayPattern(pattern))
        {
            for (const element of pattern.elements)
            {
                if (element && isDuplicated(element))
                {
                    return true;
                }
            }
        }
        else if (TypeGuard.isObjectPattern(pattern))
        {
            for (const property of pattern.properties)
            {
                if (TypeGuard.isAssignmentProperty(property))
                {
                    if (isDuplicated(property.value))
                    {
                        return true;
                    }
                }
                else if (isDuplicated(property.argument))
                {
                    return true;
                }
            }
        }
        else if (TypeGuard.isRestElement(pattern))
        {
            return isDuplicated(pattern.argument);
        }

        return false;
    };

    if (lookeaheads)
    {
        for (let index = 0; index < parameters.length; index++)
        {
            if (isDuplicated(parameters[index]))
            {
                return { result: true, token: lookeaheads[index] };
            }
        }

        return { result: false, token: null };
    }

    return parameters.some(isDuplicated);
}