import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[110px] w-full rounded-xl border border-[#b8d0e5] bg-white px-3.5 py-2 text-sm text-[#0d1b2a] ring-offset-white placeholder:text-[#7b8ea4] shadow-[0_10px_22px_-24px_rgba(9,30,66,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d7a84]/55 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };

