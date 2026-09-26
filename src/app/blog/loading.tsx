function CardSkeleton() {
 return (
 <div className="flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white">
 <div className="aspect-video w-full bg-black/5" />
 <div className="flex flex-col gap-2 p-5">
 <div className="h-3 w-24 rounded-full bg-black/5" />
 <div className="h-5 w-5/6 rounded-full bg-black/10" />
 <div className="h-4 w-full rounded-full bg-black/5" />
 <div className="h-4 w-2/3 rounded-full bg-black/5" />
 </div>
 </div>
 );
}

export default function BlogLoading() {
 return (
 <div className="animate-pulse">
 <div className="border-b border-black/5 bg-gradient-to-br from-brand-soft/60 via-brand-soft/20 to-white">
 <div className="mx-auto max-w-[1600px] px-[15px] py-8 text-center sm:py-10">
 <div className="mx-auto h-9 w-64 rounded-full bg-black/10" />
 </div>
 </div>

 <div className="mx-auto max-w-[1600px] px-[15px] py-10 ">
 <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
 {Array.from({ length: 9 }, (_, i) => (
 <CardSkeleton key={i} />
 ))}
 </div>
 </div>
 </div>
 );
}
