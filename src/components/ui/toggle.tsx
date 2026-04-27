"use client";

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-neutral-100 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-neutral-200",
  {
    variants: {
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
      },
      variant: {
        default: "bg-transparent",
        outline: "border border-neutral-200 bg-transparent",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  },
);

function Toggle({
  className,
  size,
  variant,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return <TogglePrimitive.Root className={cn(toggleVariants({ size, variant, className }))} {...props} />;
}

export { Toggle, toggleVariants };
