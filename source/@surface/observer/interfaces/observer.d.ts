import ISubject from "./subject";

export default interface IObserver
{
    register(subject: ISubject): void;
    update(value: unknown): void;
}