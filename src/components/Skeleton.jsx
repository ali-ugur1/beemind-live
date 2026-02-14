// Skeleton için base component
const SkeletonBase = ({ className = '', animate = true }) => (
  <div
    className={`bg-gray-800 rounded ${animate ? 'animate-pulse' : ''} ${className}`}
  />
);

// Kart skeleton
export const SkeletonCard = () => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4">
    <SkeletonBase className="h-4 w-24" />
    <SkeletonBase className="h-10 w-32" />
    <SkeletonBase className="h-3 w-full" />
  </div>
);

// Stats card skeleton
export const SkeletonStats = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
    {[1, 2, 3].map(i => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

// Tablo satırı skeleton
export const SkeletonTableRow = () => (
  <div className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-gray-800">
    <div className="col-span-1">
      <SkeletonBase className="h-4 w-4 rounded" />
    </div>
    <div className="col-span-1">
      <SkeletonBase className="h-3 w-3 rounded-full" />
    </div>
    <div className="col-span-1">
      <SkeletonBase className="h-5 w-12" />
    </div>
    <div className="col-span-5">
      <SkeletonBase className="h-4 w-48" />
    </div>
    <div className="col-span-1">
      <SkeletonBase className="h-4 w-12" />
    </div>
    <div className="col-span-3 flex justify-end gap-2">
      <SkeletonBase className="h-9 w-24" />
      <SkeletonBase className="h-9 w-16" />
    </div>
  </div>
);

// Liste skeleton
export const SkeletonTable = ({ rows = 5 }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
    <div className="px-6 py-4 bg-gray-800 border-b border-gray-700">
      <SkeletonBase className="h-4 w-full" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonTableRow key={i} />
    ))}
  </div>
);

// Detay sayfası skeleton
export const SkeletonDetail = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <SkeletonBase className="h-10 w-32" />
      <SkeletonBase className="h-6 w-48" />
    </div>
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4">
      <SkeletonBase className="h-8 w-64" />
      <SkeletonBase className="h-4 w-full" />
      <SkeletonBase className="h-32 w-full" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <SkeletonBase className="h-64 w-full rounded-lg" />
      </div>
      <div>
        <SkeletonBase className="h-64 w-full rounded-lg" />
      </div>
    </div>
  </div>
);

export default SkeletonBase;
