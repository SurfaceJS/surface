/* eslint-disable import/prefer-default-export */
import { Callable }      from "../types";
import CancellationToken from "../types/cancellation-token";

type Timer = unknown;

declare function clearTimeout(timer: Timer): Timer;
declare function setTimeout(action: Callable, timeout?: number): Timer;

export async function fireAsync<T extends Callable>(action: T, timeout?: number, cancellationToken?: CancellationToken): Promise<ReturnType<T>>
{
    return new Promise
    (
        (resolve, reject) =>
        {
            const timer = setTimeout
            (
                () =>
                {
                    if (cancellationToken?.canceled)
                    {
                        reject(new Error("Action was canceled"));
                    }
                    else
                    {
                        try
                        {
                            resolve(action());
                        }
                        catch (error)
                        {
                            reject(error);
                        }
                    }
                },
                timeout,
            );

            cancellationToken?.onCancellation.subscribe(() => (clearTimeout(timer), resolve()));
        },
    );
}