import React from 'react'

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse p-4">
      <div className="flex justify-between items-center pt-4">
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
            <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded"></div>
                <div className="h-3 w-20 bg-gray-200 dark:bg-slate-700 rounded"></div>
            </div>
        </div>
        <div className="h-8 w-16 bg-gray-200 dark:bg-slate-700 rounded"></div>
      </div>
      
      <div className="h-2 w-full bg-gray-200 dark:bg-slate-800 rounded mt-4"></div>

      <div className="space-y-4 mt-6">
        {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 h-32">
                <div className="flex gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-slate-700 rounded-full"></div>
                    <div className="space-y-2">
                        <div className="h-4 w-24 bg-gray-100 dark:bg-slate-700 rounded"></div>
                        <div className="h-3 w-16 bg-gray-100 dark:bg-slate-700 rounded"></div>
                    </div>
                </div>
                <div className="h-8 w-full bg-gray-50 dark:bg-slate-900 rounded"></div>
            </div>
        ))}
      </div>
    </div>
  )
}