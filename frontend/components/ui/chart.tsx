"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const chartVariants = cva(
  "w-full h-full",
  {
    variants: {
      size: {
        sm: "h-32",
        default: "h-64",
        lg: "h-80",
        xl: "h-96",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export interface ChartProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chartVariants> {
  title?: string
  description?: string
  loading?: boolean
}

const Chart = React.forwardRef<HTMLDivElement, ChartProps>(
  ({ className, size, title, description, loading, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-4", className)}
      {...props}
    >
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className={cn(chartVariants({ size }), "relative")}>
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
)
Chart.displayName = "Chart"

// Simple Bar Chart Component
export interface BarChartProps extends ChartProps {
  data: Array<{ label: string; value: number; color?: string }>
  maxValue?: number
}

const BarChart = React.forwardRef<HTMLDivElement, BarChartProps>(
  ({ data, maxValue, className, ...props }, ref) => {
    const max = maxValue || Math.max(...data.map(item => item.value))
    
    return (
      <Chart ref={ref} className={className} {...props}>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{item.label}</span>
                <span className="text-muted-foreground">{item.value}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${(item.value / max) * 100}%`,
                    backgroundColor: item.color || 'hsl(var(--primary))',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Chart>
    )
  }
)
BarChart.displayName = "BarChart"

// Simple Line Chart using SVG
export interface LineChartProps extends ChartProps {
  data: Array<{ x: string; y: number }>
  color?: string
}

const LineChart = React.forwardRef<HTMLDivElement, LineChartProps>(
  ({ data, color = "hsl(var(--primary))", className, ...props }, ref) => {
    const maxY = Math.max(...data.map(point => point.y))
    const minY = Math.min(...data.map(point => point.y))
    const range = maxY - minY || 1
    
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 100 - ((point.y - minY) / range) * 100
      return `${x},${y}`
    }).join(' ')
    
    return (
      <Chart ref={ref} className={className} {...props}>
        <div className="relative w-full h-full">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="2"
              points={points}
              className="transition-all duration-300"
            />
            {data.map((point, index) => {
              const x = (index / (data.length - 1)) * 100
              const y = 100 - ((point.y - minY) / range) * 100
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="3"
                  fill={color}
                  className="transition-all duration-300"
                />
              )
            })}
          </svg>
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground mt-2">
            {data.map((point, index) => (
              <span key={index} className="truncate">
                {point.x}
              </span>
            ))}
          </div>
        </div>
      </Chart>
    )
  }
)
LineChart.displayName = "LineChart"

// Pie Chart Component
export interface PieChartProps extends ChartProps {
  data: Array<{ label: string; value: number; color?: string }>
  showLabels?: boolean
}

const PieChart = React.forwardRef<HTMLDivElement, PieChartProps>(
  ({ data, showLabels = true, className, ...props }, ref) => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    const colors = [
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))',
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
      'hsl(var(--chart-5))',
    ]
    
    let cumulativePercentage = 0
    
    return (
      <Chart ref={ref} className={className} {...props}>
        <div className="flex items-center justify-center space-x-8">
          <div className="relative">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100
                const strokeDasharray = `${percentage} ${100 - percentage}`
                const strokeDashoffset = -cumulativePercentage
                const color = item.color || colors[index % colors.length]
                
                cumulativePercentage += percentage
                
                return (
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r="15.915"
                    fill="transparent"
                    stroke={color}
                    strokeWidth="4"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300"
                  />
                )
              })}
            </svg>
          </div>
          
          {showLabels && (
            <div className="space-y-2">
              {data.map((item, index) => {
                const percentage = ((item.value / total) * 100).toFixed(1)
                const color = item.color || colors[index % colors.length]
                
                return (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-medium">{item.label}</span>
                    <span className="text-muted-foreground">({percentage}%)</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Chart>
    )
  }
)
PieChart.displayName = "PieChart"

export { Chart, BarChart, LineChart, PieChart, chartVariants }