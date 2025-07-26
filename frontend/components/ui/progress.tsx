import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const progressVariants = cva(
  'relative h-2 w-full overflow-hidden rounded-full bg-secondary',
  {
    variants: {
      size: {
        sm: 'h-1',
        default: 'h-2',
        lg: 'h-3',
        xl: 'h-4',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const progressIndicatorVariants = cva(
  'h-full w-full flex-1 bg-primary transition-all duration-500 ease-out',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        success: 'bg-success',
        warning: 'bg-warning',
        error: 'bg-error',
        gradient: 'gradient-primary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants>,
    Pick<VariantProps<typeof progressIndicatorVariants>, 'variant'> {
  value?: number;
  max?: number;
  showValue?: boolean;
  label?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, size, variant, showValue, label, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    // Determine variant based on percentage
    const getVariantByPercentage = (percentage: number) => {
      if (percentage >= 100) return 'error';
      if (percentage >= 90) return 'warning';
      if (percentage >= 75) return 'success';
      return 'default';
    };

    const finalVariant = variant || getVariantByPercentage(percentage);

    return (
      <div className="w-full space-y-2">
        {(label || showValue) && (
          <div className="flex justify-between items-center">
            {label && <span className="text-sm font-medium text-foreground">{label}</span>}
            {showValue && (
              <span className="text-sm text-muted-foreground">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}
        <div
          ref={ref}
          className={cn(progressVariants({ size, className }))}
          {...props}
        >
          <div
            className={cn(progressIndicatorVariants({ variant: finalVariant }))}
            style={{ transform: `translateX(-${100 - percentage}%)` }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-label={label}
          />
        </div>
      </div>
    );
  }
);
Progress.displayName = 'Progress';

// Circular Progress Component
export interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  size?: 'sm' | 'default' | 'lg' | 'xl';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showValue?: boolean;
  strokeWidth?: number;
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  ({ className, value = 0, max = 100, size = 'default', variant = 'default', showValue, strokeWidth, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    const sizeMap = {
      sm: { size: 40, stroke: strokeWidth || 3 },
      default: { size: 60, stroke: strokeWidth || 4 },
      lg: { size: 80, stroke: strokeWidth || 5 },
      xl: { size: 120, stroke: strokeWidth || 6 },
    };
    
    const { size: circleSize, stroke } = sizeMap[size];
    const radius = (circleSize - stroke) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const colorMap = {
      default: 'text-primary',
      success: 'text-success',
      warning: 'text-warning',
      error: 'text-error',
    };

    return (
      <div
        ref={ref}
        className={cn('relative inline-flex items-center justify-center', className)}
        {...props}
      >
        <svg width={circleSize} height={circleSize} className="transform -rotate-90">
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="transparent"
            className="text-muted/20"
          />
          <circle
            cx={circleSize / 2}
            cy={circleSize / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn(colorMap[variant], 'transition-all duration-500 ease-in-out')}
          />
        </svg>
        {showValue && (
          <span className="absolute text-sm font-semibold">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    );
  }
);
CircularProgress.displayName = 'CircularProgress';

export { Progress, CircularProgress, progressVariants };