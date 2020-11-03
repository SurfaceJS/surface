import EventListener from "../event-listener";

type CancellationToken =
{
    canceled:       boolean,
    onCancellation: EventListener<void>,
};

export default CancellationToken;
