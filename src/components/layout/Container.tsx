import type { ReactNode } from "react";

/** Standard page-width wrapper: 1200px max, 16px gutter on phones, 24px+ above. */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-site px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
