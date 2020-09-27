import CancelationToken from "./types/cancelation-token";

export default class CancelationTokenSource
{
    private canceled: boolean = false;
    public readonly token: CancelationToken;

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