function CardSkeleton() {
 return (
 <div className="flex flex-col overflow-hidden rounded-lg border border-black/5 bg-white">
 <div className="aspect-square w-full bg-black/5" />
 <div className="flex flex-col gap-2 p-3">
 <div className="h-3.5 w-full rounded-full bg-black/5" />
 <div className="h-3.5 w-2/3 rounded-full bg-black/5" />
 <div className="mt-1 h-4 w-1/2 rounded-full bg-black/5" />
 </div>
 </div>
 );
}

export default function ShopLoading() {
 return (
 <div className="mx-auto max-w-[1600px] animate-pulse px-[15px] py-8 ">
 <div className="mb-6 flex flex-wrap gap-2">
 {Array.from({ length: 6 }, (_, i) => (
 <div key={i} className="h-8 w-24 rounded-full bg-black/5" />
 ))}
 </div>
 <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
 {Array.from({ length: 8 }, (_, i) => (
 <CardSkeleton key={i} />
 ))}
 </div>
 </div>
 );
}
