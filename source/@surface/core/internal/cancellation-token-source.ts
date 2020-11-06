import EventListener     from "./event-listener";
import IDisposable       from "./interfaces/disposable";
import CancellationToken from "./types/cancellation-token";

export default class CancellationTokenSource implements IDisposable
{
    private canceled: boolean = false;
    private disposed: boolean = false;

    private readonly onCancelation: EventListener<void> = new EventListener();

    public readonly token: CancellationToken;

    public constructor()
    {
        const $this = this;

        this.token =
        {
            get canceled()
            {
                return $this.canceled;
            },
            get onCancellation()
            {
                return $this.onCancelation;
            },
        };
    }

    public cancel(): void
    {
        this.canceled = true;
        this.onCancelation.notify();
    }

    public dispose(): void
    {
        if (!this.disposed)
        {
            this.disposed = true;

            this.onCancelation.dispose();
        }
    }
}