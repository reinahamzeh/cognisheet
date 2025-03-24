import React from 'react'
import { cn } from "../../lib/utils"

interface CellReferenceProps {
  range: string
  data?: { [key: string]: any }
  className?: string
}

export function CellReference({ range, data, className }: CellReferenceProps) {
  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md text-sm text-blue-700 dark:text-blue-300 font-mono hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-default group",
        className
      )}
    >
      <span className="text-xs">{range}</span>
      {data && (
        <div className="hidden group-hover:block absolute bottom-full left-0 w-max p-2 bg-white dark:bg-gray-800 border rounded-md shadow-lg text-xs">
          <pre className="text-gray-700 dark:text-gray-300">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
} 