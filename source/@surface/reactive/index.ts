import PropertyListener     from "./internal/property-listener";
import PropertySubscription from "./internal/property-subscription";
import Reactive             from "./internal/reactive";

export { PropertyListener, PropertySubscription };

export type
{
    IListener,
    IObserver,
    IPropertyListener,
    IPropertySubscription,
    IReactor,
    ISubscription
} from "./internal/interfaces";

export * from "./internal/decorators";

export default Reactive;