import PropertyObserver from "./property-observer";

export default class PropertySubject
{
    private readonly observers: Set<PropertyObserver> = new Set();

    public subscribe(listerner: PropertyObserver)
    {
        this.observers.add(listerner);
    }

    public unsubscribe(listerner: PropertyObserver)
    {
        if (!this.observers.delete(listerner))
        {
            throw new Error("Listerner not subscribed");
        }
    }

    public notify(value: unknown): void
    {
        for (const observer of this.observers)
        {
            observer.notify(value);
        }
    }
}