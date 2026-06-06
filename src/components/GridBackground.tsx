'use client';

export function GridBackground({ className = '' }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        backgroundImage: `
          linear-gradient(rgba(79, 70, 229, 0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(79, 70, 229, 0.06) 1px, transparent 1px)
        `,
        backgroundSize: '32px 32px',
      }}
    />
  );
}
