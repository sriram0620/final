import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md",
          className
        )}
        {...props}
      >
        <div className="p-6">{children}</div>
      </div>
    );
  }
);

Card.displayName = "Card";