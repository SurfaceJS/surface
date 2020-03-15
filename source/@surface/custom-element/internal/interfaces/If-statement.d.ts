import IIfStatementBranch from "./If-branch-statement";

export default interface IIfStatement
{
    branches: Array<IIfStatementBranch>;
}