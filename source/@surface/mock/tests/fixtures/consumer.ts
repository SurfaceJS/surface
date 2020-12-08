import someObject, { someValue } from "./dependency.js";

function someFactory(): { object: typeof someObject, value: number}
{
    return { object: someObject, value: someValue };
}

export default someFactory;