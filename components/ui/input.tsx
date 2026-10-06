import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg border border-white/10 bg-midnight/70 px-3.5 py-2 text-sm text-slate-100 shadow-inner-faint transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 hover:border-white/20 focus-visible:border-cyan/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/25 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[92px] w-full rounded-lg border border-white/10 bg-midnight/70 px-3.5 py-2.5 text-sm text-slate-100 shadow-inner-faint transition-colors placeholder:text-slate-500 hover:border-white/20 focus-visible:border-cyan/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/25 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

const NumberInput = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <Input
    ref={ref}
    inputMode="numeric"
    className={cn("mono-nums text-center text-base", className)}
    {...props}
  />
));
NumberInput.displayName = "NumberInput";

export { Input, Textarea, NumberInput };
