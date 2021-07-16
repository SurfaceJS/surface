export default interface IConstraint
{
    validate(value: string): boolean;
}