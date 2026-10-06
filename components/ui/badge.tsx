import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider transition-colors [&_svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-blue-500/35 bg-blue-500/12 text-blue-400",
        cyan: "border-cyan-400/35 bg-cyan-400/12 text-cyan-300",
        outline: "border-white/12 bg-transparent text-slate-300",
        muted: "border-white/8 bg-white/[0.04] text-slate-400",
        success: "border-emerald-400/35 bg-emerald-400/12 text-emerald-300",
        warning: "border-amber-400/35 bg-amber-400/12 text-amber-300",
        amber: "border-amber-400/35 bg-amber-400/12 text-amber-300",
        danger: "border-red-500/35 bg-red-500/12 text-red-400",
        violet: "border-violet-400/35 bg-violet-400/12 text-violet-300",
      },
      size: {
        sm: "px-1.5 py-0 text-[10px]",
        default: "px-2 py-0.5 text-[11px]",
        lg: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
