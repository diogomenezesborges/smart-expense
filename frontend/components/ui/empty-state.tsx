import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { FileX, Search, Database, Inbox } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const emptyStateVariants = cva(
  "flex flex-col items-center justify-center text-center p-8 space-y-4",
  {
    variants: {
      size: {
        sm: "p-4 space-y-2",
        default: "p-8 space-y-4",
        lg: "p-12 space-y-6",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const iconMap = {
  default: Inbox,
  search: Search,
  data: Database,
  file: FileX,
}

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
  icon?: keyof typeof iconMap | React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: "default" | "outline" | "ghost"
  }
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, size, icon = "default", title, description, action, ...props }, ref) => {
    const IconComponent = typeof icon === "string" ? iconMap[icon] : icon

    return (
      <div
        ref={ref}
        className={cn(emptyStateVariants({ size, className }))}
        {...props}
      >
        <div className="flex flex-col items-center space-y-3">
          <div className="rounded-full bg-muted p-4">
            <IconComponent className="h-8 w-8 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground max-w-sm">
                {description}
              </p>
            )}
          </div>
          
          {action && (
            <Button
              variant={action.variant || "default"}
              onClick={action.onClick}
              className="mt-4"
            >
              {action.label}
            </Button>
          )}
        </div>
      </div>
    )
  }
)
EmptyState.displayName = "EmptyState"

export { EmptyState, emptyStateVariants }