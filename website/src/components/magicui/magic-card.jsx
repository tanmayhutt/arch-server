import React, { useRef } from "react";
import { cn } from "@/lib/utils";

export const MagicCard = ({
  as: Component = "div",
  className,
  children,
  size = 600,
  spotlightColor = "rgba(255,255,255,0.03)",
  spotlightBorderColor = "rgba(255,255,255,0.15)",
  ...props
}) => {
  const elementRef = useRef(null);

  const setSpotlightOpacity = (opacity) => {
    elementRef.current?.style.setProperty("--spotlight-opacity", opacity);
  };

  const supportsPointerSpotlight = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const handlePointerMove = (event) => {
    const element = elementRef.current;
    if (!element || !supportsPointerSpotlight()) return;

    const rect = element.getBoundingClientRect();
    element.style.setProperty("--spotlight-x", `${event.clientX - rect.left}px`);
    element.style.setProperty("--spotlight-y", `${event.clientY - rect.top}px`);
  };

  const handleFocusCapture = () => setSpotlightOpacity("1");
  const handlePointerEnter = () => {
    if (supportsPointerSpotlight()) setSpotlightOpacity("1");
  };
  const handlePointerLeave = () => {
    if (supportsPointerSpotlight()) setSpotlightOpacity("0");
  };
  const handleBlurCapture = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setSpotlightOpacity("0");
  };

  return (
    <Component
      ref={elementRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onFocusCapture={handleFocusCapture}
      onBlurCapture={handleBlurCapture}
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#080b0d]/90 backdrop-blur-xl",
        className,
      )}
      {...props}
    >
      <div
        className="pointer-events-none absolute -inset-px z-0 transition-opacity duration-300"
        style={{
          opacity: "var(--spotlight-opacity, 0)",
          background: `radial-gradient(${size}px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), ${spotlightBorderColor}, transparent 42%)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity: "var(--spotlight-opacity, 0)",
          background: `radial-gradient(${size}px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), ${spotlightColor}, transparent 42%)`,
        }}
      />
      {children}
    </Component>
  );
};

export default MagicCard;
