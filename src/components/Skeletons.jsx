export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Skeleton do Header */}
      <div className="flex justify-between items-center px-4 pt-8">
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
            </div>
        </div>
        <div className="h-8 w-16 bg-gray-200 rounded"></div>
      </div>
      <div className="px-4">
        <div className="h-2 w-full bg-gray-200 rounded-full"></div>
      </div>

      {/* Skeleton dos Cards de Período */}
      <div className="p-4 space-y-4">
        {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm h-32">
                <div className="flex justify-between mb-4">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full"></div>
                        <div className="space-y-2">
                            <div className="h-4 w-24 bg-gray-100 rounded"></div>
                            <div className="h-3 w-16 bg-gray-100 rounded"></div>
                        </div>
                    </div>
                </div>
                <div className="h-8 w-full bg-gray-50 rounded"></div>
            </div>
        ))}
      </div>
    </div>
  )
}