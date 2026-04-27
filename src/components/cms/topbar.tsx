"use client";

import type { ReactNode } from "react";

interface TopbarProps {
  title: string;
  children?: ReactNode;
}

export function Topbar({ title, children }: TopbarProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-neutral-200 bg-white/95 px-6 backdrop-blur">
      <h1 className="text-xl font-semibold text-neutral-900">{title}</h1>
      {children ? <div className="flex items-center gap-3">{children}</div> : null}
    </header>
  );
}
