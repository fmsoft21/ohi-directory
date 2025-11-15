'use client';

export default function GradientBackground({
  variant = 'default',
  className = '',
}) {
  const variants = {
    default: (
      <>
        <div className="h-6 sm:h-24 w-3/3 bg-gradient-to-br from-emerald-500 opacity-20 blur-2xl dark:from-emerald-500 dark:invisible dark:opacity-40" />
        <div className="h-24 sm:h-24 w-2/3 bg-gradient-to-r from-emerald-500 opacity-40 blur-2xl dark:from-emerald-500 dark:opacity-40" />
      </>
    ),
    subtle: (
      <>
        <div className="h-4 sm:h-20 w-full bg-gradient-to-r from-emerald-400 opacity-10 blur-3xl dark:from-emerald-600 dark:opacity-20" />
      </>
    ),
    intense: (
      <>
        <div className="h-6 sm:h-32 w-1/2 bg-gradient-to-br from-emerald-500 to-emerald-400 opacity-30 blur-2xl dark:opacity-50" />
        <div className="h-8 sm:h-32 w-1/3 bg-gradient-to-r from-emerald-400 opacity-40 blur-2xl dark:opacity-60" />
      </>
    ),
  };

  return (
    <div
      className={`absolute top-0 inset-x-0 h-32 sm:h-40 flex items-start pointer-events-none ${className}`}
    >
      {variants[variant] || variants.default}
    </div>
  );
}
