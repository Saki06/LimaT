import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#0d5c4d] text-white shadow hover:bg-[#083e34]",
        secondary:
          "border-slate-200 bg-slate-100 text-slate-800",
        destructive:
          "border-rose-200 bg-rose-50 text-rose-700",
        outline: "text-slate-700 border-slate-300 bg-white",
        success:
          "border-[#c4e9e0] bg-[#ecf8f5] text-[#0d5c4d]",
        warning:
          "border-[#fde4af] bg-[#fef7e6] text-[#b47a16]",
        info:
          "border-sky-200 bg-sky-50 text-sky-800",
        purple:
          "border-purple-200 bg-purple-50 text-purple-800"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
