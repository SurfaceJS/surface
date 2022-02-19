import type { Constructor } from "@surface/core";
import type HTMLXElement   from "@surface/htmlx-element";
import { event, styles }    from "@surface/htmlx-element";
import style                from "./index.scss";

const ANIMATION_ENTER = "animation-enter";
const ANIMATION_IN    = "animation-in";
const ANIMATION_OUT   = "animation-out";
const RIPPLE          = "ripple";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function lineRippleable<T extends Constructor<HTMLXElement & { noRipple: boolean, readonly rippleable: HTMLElement }>>(superClass: T): ILineRippleable & T
{
    @styles(style)
    class LineRippleable extends superClass implements ILineRippleable
    {
        @event("focus")
        protected showLineRipple(): void
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
                    },
                );
            }
        }

        @event("focusout")
        protected hideLineRipple(): void
        {
            if (!this.noRipple)
            {
                const ripples = this.rippleable.querySelectorAll<HTMLElement>(`.${RIPPLE}`);

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
                    timeLeft,
                );
            }
        }
    }

    return LineRippleable;
}

export interface ILineRippleable
{

}

export default lineRippleable;