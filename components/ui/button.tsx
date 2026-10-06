import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-midnight disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:translate-y-px",
  {
    variants: {
      variant: {
        default:
          "bg-blue-500 text-white shadow-[0_10px_30px_-12px_rgba(59,130,246,0.9)] hover:bg-blue-600",
        secondary:
          "border border-white/10 bg-slate-800/80 text-slate-100 hover:border-cyan/40 hover:bg-slate-800",
        outline:
          "border border-white/12 bg-transparent text-slate-200 hover:border-cyan/50 hover:text-cyan-300",
        ghost: "text-slate-300 hover:bg-white/[0.06] hover:text-slate-50",
        link: "text-cyan-300 underline-offset-4 hover:underline",
        cyan: "bg-cyan-400 text-midnight font-semibold hover:bg-cyan-300 shadow-[0_10px_30px_-12px_rgba(34,211,238,0.9)]",
        success:
          "bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 hover:bg-emerald-500/25",
        warning:
          "bg-amber-400/15 text-amber-300 border border-amber-400/30 hover:bg-amber-400/25",
        destructive:
          "bg-red-500/15 text-red-400 border border-red-500/35 hover:bg-red-500/25",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-6 text-[15px]",
        icon: "h-9 w-9",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
