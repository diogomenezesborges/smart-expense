import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const spinnerVariants = cva(
  "animate-spin",
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        default: "h-6 w-6",
        lg: "h-8 w-8",
        xl: "h-12 w-12",
      },
      variant: {
        default: "text-primary",
        muted: "text-muted-foreground",
        white: "text-white",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  text?: string
  fullScreen?: boolean
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size, variant, text, fullScreen, ...props }, ref) => {
    const content = (
      <div className={cn("flex flex-col items-center justify-center space-y-2", className)} {...props}>
        <Loader2 className={cn(spinnerVariants({ size, variant }))} />
        {text && (
          <p className="text-sm text-muted-foreground animate-pulse">
            {text}
          </p>
        )}
      </div>
    )

    if (fullScreen) {
      return (
        <div
          ref={ref}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          {content}
        </div>
      )
    }

    return (
      <div ref={ref}>
        {content}
      </div>
    )
  }
)
LoadingSpinner.displayName = "LoadingSpinner"

// Inline spinner for buttons and small spaces
export interface InlineSpinnerProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    Pick<VariantProps<typeof spinnerVariants>, "size" | "variant"> {}

const InlineSpinner = React.forwardRef<HTMLSpanElement, InlineSpinnerProps>(
  ({ className, size = "sm", variant = "default", ...props }, ref) => (
    <span ref={ref} className={cn("inline-flex", className)} {...props}>
      <Loader2 className={cn(spinnerVariants({ size, variant }))} />
    </span>
  )
)
InlineSpinner.displayName = "InlineSpinner"

export { LoadingSpinner, InlineSpinner, spinnerVariants }