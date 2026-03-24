export default function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-10 w-full animate-pulse">
      
      {/* High-level KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="glass rounded-2xl p-6 h-32 border border-white/5 bg-white/5 flex flex-col justify-between">
            <div className="w-1/2 h-4 bg-white/10 rounded"></div>
            <div className="w-3/4 h-8 bg-white/10 rounded mt-4"></div>
            <div className="w-1/3 h-3 bg-white/10 rounded"></div>
          </div>
        ))}
      </div>
      
      {/* Visual Analytics Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="glass rounded-2xl p-6 h-[400px] border border-white/5 bg-white/5 flex flex-col">
          <div className="w-1/3 h-6 bg-white/10 rounded mb-6"></div>
          <div className="flex-1 w-full bg-white/5 rounded-xl"></div>
        </div>
        <div className="glass rounded-2xl p-6 h-[400px] border border-white/5 bg-white/5 flex flex-col">
          <div className="w-1/3 h-6 bg-white/10 rounded mb-6"></div>
          <div className="flex-1 w-full bg-white/5 rounded-xl"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="glass rounded-2xl p-6 h-64 border border-white/5 bg-white/5">
         <div className="w-1/4 h-6 bg-white/10 rounded mb-6"></div>
         <div className="flex flex-col gap-3">
           <div className="w-full h-10 bg-white/10 rounded"></div>
           <div className="w-full h-10 bg-white/10 rounded"></div>
           <div className="w-full h-10 bg-white/10 rounded"></div>
         </div>
      </div>

    </div>
  );
}
