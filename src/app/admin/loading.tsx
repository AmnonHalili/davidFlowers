export default function AdminLoading() {
    return (
        <div className="p-10 max-w-7xl mx-auto space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="space-y-4">
                <div className="h-8 w-48 bg-stone-200 rounded"></div>
                <div className="h-4 w-64 bg-stone-200 rounded"></div>
            </div>

            {/* Content Skeleton - mimics table or cards */}
            <div className="bg-white rounded-lg border border-stone-200 shadow-sm p-6 space-y-6">
                <div className="flex justify-between border-b border-stone-100 pb-4">
                    <div className="h-6 w-32 bg-stone-100 rounded"></div>
                    <div className="h-8 w-24 bg-stone-100 rounded"></div>
                </div>

                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex gap-4">
                            <div className="h-12 w-12 bg-stone-100 rounded shrink-0"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-3/4 bg-stone-100 rounded"></div>
                                <div className="h-3 w-1/2 bg-stone-50 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
