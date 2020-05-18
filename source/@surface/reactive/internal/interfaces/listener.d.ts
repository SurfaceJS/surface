export default interface IListener<T = unknown>
{
    notify(value: T): void;
}