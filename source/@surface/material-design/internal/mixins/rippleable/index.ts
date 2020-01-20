import { Constructor }   from "@surface/core";
import { typeGuard }     from "@surface/core/common/generic";
import { query, styles } from "@surface/custom-element/decorators";
import Component         from "../../..";
import style             from "./index.scss";

const ANIMATION_ENTER = "animation-enter";
const ANIMATION_IN    = "animation-in";
const ANIMATION_OUT   = "animation-out";
const RIPPLE          = "ripple";

// tslint:disable:no-any
export default <T extends Constructor<Component>>(superClass: T) =>
{
    @styles(style)
    class Rippleable extends superClass
    {
        private firedByTouch: boolean = false;

        @query(".rippleable", true)
        private readonly rippleable!: HTMLElement;

        public get classes(): Record<string, boolean>
        {
            return { ...super.classes, rippleable: true };
        }

        public constructor(...args: Array<any>)
        {
            super(...args);

            super.addEventListener("touchstart", x => this.show(x), { passive: true });
            super.addEventListener("touchend", () => this.hide(), { passive: true });
            super.addEventListener("touchcancel", () => this.hide());

            super.addEventListener("mousedown", x => this.show(x));
            super.addEventListener("mouseup", () => this.hide());
            super.addEventListener("mouseleave", () => this.hide());
            super.addEventListener("dragstart", () => this.hide());
        }

        private show(event: MouseEvent|TouchEvent): void
        {
            const isTouch = event instanceof TouchEvent;

            console.log(isTouch);

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

            const size   = Math.sqrt((bounding.height ** 2) + (bounding.width ** 2)) * 2;
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

            this.rippleable.append(ripple);

            setTimeout
            (
                () =>
                {
                    ripple.classList.remove(ANIMATION_ENTER);
                    ripple.classList.add(ANIMATION_IN);

                    ripple.style.transform = "scale(1)";
                    ripple.style.opacity   = "0.25";
                }
            );
        }

        private hide(): void
        {
            const ripples = this.rippleable.querySelectorAll<HTMLElement>("." + RIPPLE);

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
                timeLeft
            );
        }
    }

    return Rippleable;
};