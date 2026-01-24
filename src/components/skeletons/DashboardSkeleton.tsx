export default function DashboardSkeleton() {
    return (
        <div className="space-y-8 animate-pulse pb-8">
            {/* Header Skeleton */}
            <div>
                <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2"></div>
                <div className="h-4 w-96 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-6 border border-[var(--border-color)] rounded-xl flex items-center gap-5 bg-[var(--surface)]">
                        <div className="w-14 h-14 rounded-2xl bg-gray-200 dark:bg-gray-800"></div>
                        <div className="space-y-2">
                            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Continue Learning Skeleton */}
            <div>
                <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
                <div className="p-6 border border-[var(--border-color)] rounded-xl bg-[var(--surface)] min-h-[140px]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5 w-full">
                            <div className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-gray-800 shrink-0"></div>
                            <div className="space-y-3 w-full max-w-md">
                                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
                                <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tracks Skeleton */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 rounded-2xl bg-gray-200 dark:bg-gray-800 border border-[var(--border-color)]"></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
