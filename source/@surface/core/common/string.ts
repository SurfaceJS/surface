export function camelToText(value: string): string
{
    return value.split(/(?=[A-Z])/g).join(" ").toLowerCase();
}

export function camelToDashed(value: string): string
{
    return value.split(/(?=[A-Z])/g).join("-").toLowerCase();
}

export function dashedToCamel<T extends string>(value: T): T;
export function dashedToCamel(value: string): string;
export function dashedToCamel(value: string): string
{
    return value.replace(/-([a-z])/g, (_, group) => group.toUpperCase());
}

export function dashedToTitle(value: string): string
{
    return value.replace(/(^[a-z]|-[a-z])/g, (_, group) => group.replace(/-/g, "").toUpperCase());
}

export function toTitle(value: string): string
{
    return value.replace(/(^[a-z]|\s+[a-z])/g, (_, group) => group.toUpperCase());
}

export function uuidv4()
{
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace
    (
        /[xy]/g,
        character =>
        {
            const random = Math.random() * 16 | 0;
            const value  = character == "x" ? random : (random & 0x3 | 0x8);
            return value.toString(16);
        }
    );
  }