import type CancellationToken from "./types/cancellation-token";

export default class CancellationTokenSource
{
    private canceled: boolean = false;

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
        };
    }

    public cancel(): void
    {
        this.canceled = true;
    }
}