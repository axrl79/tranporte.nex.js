export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-24 w-24 bg-gray-200 rounded-full animate-pulse" />
              <div className="space-y-2 text-center">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="space-y-4">
            <div className="flex space-x-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
            <div className="border rounded-lg p-6">
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
