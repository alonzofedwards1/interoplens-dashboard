import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", ...props }, ref) => {
        const baseStyles = "px-4 py-2 rounded font-medium";
        const variantStyles = {
            default: "bg-blue-600 text-white hover:bg-blue-700",
            destructive: "bg-red-600 text-white hover:bg-red-700",
            outline: "border border-gray-300 text-gray-800",
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variantStyles[variant], className)}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";

export { Button };
