"use client";

export function SceneFallback() {
  return (
    <div
      className="fallback-orbit absolute inset-0"
      aria-hidden="true"
      data-testid="scene-fallback"
    />
  );
}
