/* eslint-disable import/prefer-default-export */
export function timestamp(): string
{
    return new Date().toISOString().replace(/[-T:]/g, "").substring(0, 12);
}
