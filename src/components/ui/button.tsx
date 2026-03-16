import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d7a84]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#006d77] via-[#007d88] to-[#005963] text-white shadow-[0_14px_30px_-16px_rgba(0,109,119,0.75)] hover:-translate-y-0.5 hover:from-[#007a85] hover:to-[#00626c]",
        secondary:
          "border border-[#9dcfd0] bg-[#e6f8f7] text-[#055d66] shadow-[0_10px_24px_-20px_rgba(0,109,119,0.5)] hover:bg-[#d6f2f0]",
        outline:
          "border border-[#b8d0e5] bg-white text-[#0d1b2a] shadow-[0_12px_24px_-22px_rgba(9,30,66,0.45)] hover:border-[#95bfdc] hover:bg-[#f7fbff]",
        ghost: "text-[#1f3b59] hover:bg-[#e9f2fb]",
        destructive:
          "bg-gradient-to-r from-rose-700 to-rose-600 text-white shadow-[0_14px_30px_-16px_rgba(190,24,93,0.7)] hover:from-rose-600 hover:to-rose-500",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-3.5 text-xs",
        lg: "h-12 px-7 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
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
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

