import { Constructor, typeGuard }       from "@surface/core";
import CustomElement, { event, styles } from "@surface/custom-element";
import style                            from "./index.scss";

const ANIMATION_ENTER = "animation-enter";
const ANIMATION_IN    = "animation-in";
const ANIMATION_OUT   = "animation-out";
const RIPPLE          = "ripple";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const rippleable = <T extends Constructor<CustomElement>>(superClass: T) =>
{
    @styles(style)
    abstract class Rippleable extends superClass
    {
        private firedByTouch: boolean = false;

        protected abstract readonly rippleable: HTMLElement;

        @event("mousedown")
        @event("touchstart", { passive: true })
        protected show(event: MouseEvent|TouchEvent): void
        {
            this.rippleable.classList.add("rippleable");

            const isTouch = event instanceof TouchEvent;

            if (!isTouch && this.firedByTouch)
            {
                this.firedByTouch = false;

                return;
            }

            const bounding = this.rippleable.getBoundingClientRect();

            this.firedByTouch = isTouch;

            const { pageX, pageY } = typeGuard<TouchEvent>(event, isTouch)
                ? event.touches[event.touches.length - 1]
                : event;

            const x = pageX - (bounding.x + window.scrollX);
            const y = pageY - (bounding.y + window.scrollY);

            const size   = Math.sqrt(bounding.height ** 2 + bounding.width ** 2) * 2;
            const offset = size / 2;

            const ripple = document.createElement("span");

            ripple.classList.add(RIPPLE);
            ripple.classList.add(ANIMATION_ENTER);

            ripple.style.width     = `${size}px`;
            ripple.style.height    = ripple.style.width;
            ripple.style.left      = `${x + -offset}px`;
            ripple.style.top       = `${y + -offset}px`;
            ripple.style.transform = "scale(0)";

            ripple.dataset.animationStart = `${performance.now()}`;

            this.rippleable.appendChild(ripple);

            setTimeout
            (
                () =>
                {
                    ripple.classList.remove(ANIMATION_ENTER);
                    ripple.classList.add(ANIMATION_IN);

                    ripple.style.transform = "scale(1)";
                    ripple.style.opacity   = "0.25";
                },
            );
        }

        @event("mouseup")
        @event("dragstart")
        @event("touchcancel")
        @event("touchend", { passive: true })
        protected hide(): void
        {
            const ripples = this.rippleable.querySelectorAll<HTMLElement>(`.${RIPPLE}`);

            if (ripples.length == 0)
            {
                return;
            }

            const ripple = ripples[ripples.length - 1];

            const remaining = performance.now() - Number.parseInt(ripple.dataset.animationStart!);
            const timeLeft  = Math.max(250 - remaining, 0);

            setTimeout
            (
                () =>
                {
                    ripple.classList.remove(ANIMATION_IN);
                    ripple.classList.add(ANIMATION_OUT);

                    ripple.style.opacity = "0";
                    setTimeout(() => ripples.forEach(x => x.parentNode && x.remove()), 300);
                },
                timeLeft,
            );
        }
    }

    return Rippleable;
};

export default rippleable;