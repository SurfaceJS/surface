import { ObjectLiteral } from "../types";

export default interface IPackage
{
    dependencies:    ObjectLiteral<string>;
    devDependencies: ObjectLiteral<string>;
    name:            string;
    path:            string;
    version:         string;
}