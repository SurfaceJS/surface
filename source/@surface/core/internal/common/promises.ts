/* eslint-disable import/prefer-default-export */
import TaskCanceledError from "../errors/task-canceled-error";
import { Callable }      from "../types";
import CancellationToken from "../types/cancellation-token";

type Timer = unknown;

declare function setTimeout(action: Callable, timeout?: number): Timer;

export async function runAsync<T>(task: () => T | Promise<T>, timeout?: number, cancellationToken?: CancellationToken): Promise<T>
{
    return new Promise
    (
        (resolve, reject) =>
        {
            setTimeout
            (
                () =>
                {
                    if (cancellationToken?.canceled)
                    {
                        reject(new TaskCanceledError());
                    }
                    else
                    {
                        try
                        {
                            const value = task();

                            if (value instanceof Promise)
                            {
                                value.then(resolve, reject);
                            }
                            else
                            {
                                resolve(value);
                            }
                        }
                        catch (error)
                        {
                            reject(error);
                        }
                    }
                },
                timeout,
            );
        },
    );
}