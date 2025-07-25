import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const listVariants = cva("", {
  variants: {
    variant: {
      default: "space-y-1",
      divided: "divide-y divide-border",
      bordered: "border border-border rounded-lg",
      card: "border border-border rounded-lg bg-card shadow-sm",
    },
    spacing: {
      none: "",
      sm: "space-y-1",
      default: "space-y-2", 
      lg: "space-y-4",
    },
  },
  defaultVariants: {
    variant: "default",
    spacing: "default",
  },
})

const listItemVariants = cva(
  "flex items-center justify-between py-2 px-3 transition-colors",
  {
    variants: {
      variant: {
        default: "",
        interactive: "hover:bg-accent hover:text-accent-foreground cursor-pointer focus:bg-accent focus:text-accent-foreground focus:outline-none",
        divided: "first:pt-0 last:pb-0",
        card: "first:rounded-t-lg last:rounded-b-lg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ListProps
  extends React.HTMLAttributes<HTMLUListElement>,
    VariantProps<typeof listVariants> {}

const List = React.forwardRef<HTMLUListElement, ListProps>(
  ({ className, variant, spacing, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn(listVariants({ variant, spacing }), className)}
      {...props}
    />
  )
)
List.displayName = "List"

export interface ListItemProps
  extends React.HTMLAttributes<HTMLLIElement>,
    VariantProps<typeof listItemVariants> {
  leftContent?: React.ReactNode
  rightContent?: React.ReactNode
}

const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(
  ({ className, variant, leftContent, rightContent, children, ...props }, ref) => (
    <li
      ref={ref}
      className={cn(listItemVariants({ variant }), className)}
      {...props}
    >
      {leftContent && <div className="flex-shrink-0 mr-3">{leftContent}</div>}
      <div className="flex-1 min-w-0">{children}</div>
      {rightContent && <div className="flex-shrink-0 ml-3">{rightContent}</div>}
    </li>
  )
)
ListItem.displayName = "ListItem"

export { List, ListItem, listVariants, listItemVariants }