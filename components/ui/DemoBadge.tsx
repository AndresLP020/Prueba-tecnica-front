export function DemoBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center border border-brass/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-brass ${className}`}
    >
      demo
    </span>
  );
}
