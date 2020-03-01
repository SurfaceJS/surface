import { Constructor }   from "@surface/core";
//import { typeGuard }     from "@surface/core/common/generic";
import CustomElement     from "@surface/custom-element";
import { event, styles } from "@surface/custom-element/decorators";
import style             from "./index.scss";

const ANIMATION_ENTER = "animation-enter";
const ANIMATION_IN    = "animation-in";
const ANIMATION_OUT   = "animation-out";
const RIPPLE          = "ripple";

// tslint:disable:no-any
export default <T extends Constructor<CustomElement>>(superClass: T) =>
{
    @styles(style)
    abstract class LineRippleable extends superClass
    {
        protected abstract readonly rippleable: HTMLElement;

        protected abstract noRipple: boolean;

        @event("focus")
        protected show(): void
        {
            if (!this.noRipple)
            {
                this.rippleable.classList.add("rippleable");

                const ripple = document.createElement("span");

                ripple.classList.add(RIPPLE);
                ripple.classList.add(ANIMATION_ENTER);

                ripple.style.transform = "scaleX(0)";

                ripple.dataset.animationStart = `${performance.now()}`;

                this.rippleable.appendChild(ripple);

                setTimeout
                (
                    () =>
                    {
                        ripple.classList.remove(ANIMATION_ENTER);
                        ripple.classList.add(ANIMATION_IN);

                        ripple.style.transform = "scaleX(1)";
                    }
                );
            }
        }

        @event("focusout")
        protected hide(): void
        {
            if (!this.noRipple)
            {
                const ripples = this.rippleable.querySelectorAll<HTMLElement>("." + RIPPLE);

                if (ripples.length == 0)
                {
                    return;
                }

                const ripple = ripples[0];

                const remaining = performance.now() - Number.parseInt(ripple.dataset.animationStart!);
                const timeLeft  = Math.max(250 - remaining, 0);

                setTimeout
                (
                    () =>
                    {
                        ripple.classList.remove(ANIMATION_IN);
                        ripple.classList.add(ANIMATION_OUT);

                        ripple.style.transform = "scaleX(0)";

                        setTimeout(() => ripples.forEach(x => x.parentNode && x.remove()), 300);
                    },
                    timeLeft
                );
            }
        }
    }

    return LineRippleable;
};