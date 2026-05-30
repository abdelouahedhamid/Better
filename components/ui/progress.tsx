"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const ProgressContext = React.createContext<{ value?: number | null }>({})

function Progress({
  className,
  children,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressContext.Provider value={{ value }}>
      <ProgressPrimitive.Root
        value={value}
        data-slot="progress"
        className={cn("flex flex-wrap gap-3", className)}
        {...props}
      >
        {children}
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </ProgressPrimitive.Root>
    </ProgressContext.Provider>
  )
}

function ProgressTrack({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted",
        className
      )}
      data-slot="progress-track"
      {...props}
    />
  )
}

function ProgressIndicator({
  className,
  style,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Indicator>) {
  const { value } = React.useContext(ProgressContext)
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn("h-full bg-primary transition-all", className)}
      style={{ transform: `translateX(-${100 - (value ?? 0)}%)`, ...style }}
      {...props}
    />
  )
}

function ProgressLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("text-sm font-medium", className)}
      data-slot="progress-label"
      {...props}
    />
  )
}

function ProgressValue({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "ml-auto text-sm text-muted-foreground tabular-nums",
        className
      )}
      data-slot="progress-value"
      {...props}
    />
  )
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
}
