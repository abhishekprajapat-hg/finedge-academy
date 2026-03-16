import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "border-[#9bcfd1] bg-[#e2f5f4] text-[#055b64]",
        neutral: "border-[#c8d9ea] bg-[#edf4fb] text-[#27425d]",
        warning: "border-[#efd19b] bg-[#fff4dd] text-[#8f4d08]",
        destructive: "border-[#f2b5c3] bg-[#ffe7ef] text-[#9f1239]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

