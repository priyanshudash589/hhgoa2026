"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./ScrollFloat.css";

gsap.registerPlugin(ScrollTrigger);

interface ScrollFloatProps {
  children: React.ReactNode;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
  textClassName?: string;
  textStyle?: React.CSSProperties;
  animationDuration?: number;
  ease?: string;
  scrollStart?: string;
  scrollEnd?: string;
  stagger?: number;
}

const ScrollFloat: React.FC<ScrollFloatProps> = ({
  children,
  scrollContainerRef,
  containerClassName = "",
  containerStyle = {},
  textClassName = "",
  textStyle = {},
  animationDuration = 1,
  ease = "back.inOut(2)",
  scrollStart = "center bottom+=50%",
  scrollEnd = "bottom bottom-=40%",
  stagger = 0.08,
}) => {
  const containerRef = useRef<HTMLHeadingElement>(null);

  const splitText = useMemo(() => {
    if (typeof children !== "string") return children;
    return children.split("").map((char, index) => (
      <span className="char" key={index}>
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chars = el.querySelectorAll(".char");
    if (chars.length === 0) return;

    const animation = gsap.fromTo(
      chars,
      {
        willChange: "opacity, transform",
        opacity: 0,
        yPercent: 120,
      },
      {
        duration: animationDuration,
        ease: ease,
        opacity: 1,
        yPercent: 0,
        stagger: stagger,
        scrollTrigger: {
          trigger: el,
          scroller: scrollContainerRef?.current || window,
          start: scrollStart,
          end: scrollEnd,
          scrub: true,
        },
      }
    );

    return () => {
      animation.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [
    animationDuration,
    ease,
    scrollStart,
    scrollEnd,
    stagger,
    scrollContainerRef,
  ]);

  return (
    <div
      ref={containerRef}
      className={`scroll-float-container ${containerClassName}`}
      style={containerStyle}
    >
      <span
        className={`scroll-float-text ${textClassName}`}
        style={{
          ...textStyle,
          justifyContent:
            textStyle.textAlign === "center"
              ? "center"
              : textStyle.textAlign === "right"
                ? "flex-end"
                : "flex-start",
        }}
      >
        {splitText}
      </span>
    </div>
  );
};

export default ScrollFloat;
