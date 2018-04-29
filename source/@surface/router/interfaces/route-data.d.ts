import { ObjectLiteral, Nullable } from "@surface/core";

export default interface IRouteData
{
    match:  string;
    params: ObjectLiteral<string>;
    root:   string;
    route:  string;
    search: Nullable<ObjectLiteral<string>>;
}