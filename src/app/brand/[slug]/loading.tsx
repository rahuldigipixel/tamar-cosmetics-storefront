function CardSkeleton() {
 return (
 <div className="flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white">
 <div className="aspect-square w-full bg-black/5" />
 <div className="flex flex-col gap-2 p-4">
 <div className="h-4 w-full rounded-full bg-black/5" />
 <div className="h-4 w-2/3 rounded-full bg-black/5" />
 <div className="mt-2 h-6 w-1/2 rounded-full bg-black/5" />
 <div className="mt-2 h-11 w-full rounded-full bg-black/5" />
 </div>
 </div>
 );
}

export default function BrandLoading() {
 return (
 <div className="animate-pulse">
 <div className="border-b border-black/5 bg-gradient-to-br from-brand-soft/60 via-brand-soft/20 to-white">
 <div className="mx-auto max-w-[1600px] px-[15px] py-8 sm:py-12">
 <div className="mb-3 h-4 w-40 rounded-full bg-black/10" />
 <div className="h-9 w-64 rounded-full bg-black/10" />
 </div>
 </div>

 <div className="mx-auto max-w-[1600px] px-[15px] py-8 ">
 <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
 {Array.from({ length: 8 }, (_, i) => (
 <CardSkeleton key={i} />
 ))}
 </div>
 </div>
 </div>
 );
}
