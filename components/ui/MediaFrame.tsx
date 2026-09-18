"use client";

import Image from "next/image";
import { useReducedMotion } from "motion/react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  kenburns?: boolean;
  priority?: boolean;
  sizes?: string;
};

export function MediaFrame({
  src,
  alt,
  className = "",
  kenburns = false,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
}: Props) {
  const reduce = useReducedMotion();
  const live = kenburns && !reduce;
  const fillsParent = /\babsolute\b/.test(className);

  return (
    <div
      className={`${fillsParent ? "" : "relative"} overflow-hidden bg-[#cfc6b8] ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        width={1800}
        height={1200}
        priority={priority}
        sizes={sizes}
        unoptimized
        className={`object-cover transition duration-700 ease-out group-hover:scale-105 ${live ? "kenburns" : ""}`}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          maxWidth: "none",
          objectFit: "cover",
        }}
      />
    </div>
  );
}
