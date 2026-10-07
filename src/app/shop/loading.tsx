function CardSkeleton() {
 return (
 <div className="flex flex-col border border-black/5 bg-white p-[15px]">
 <div className="aspect-square w-full bg-black/5" />
 <div className="mt-3 flex flex-col gap-2">
 <div className="h-3.5 w-full rounded-full bg-black/5" />
 <div className="h-3.5 w-2/3 rounded-full bg-black/5" />
 <div className="mt-1 h-4 w-1/2 rounded-full bg-black/5" />
 </div>
 </div>
 );
}

export default function ShopLoading() {
 return (
 <div className="animate-pulse">
 <div className="bg-[#fde7eb] px-[15px] py-[15px] text-center">
 <h1 className="text-[28px] font-bold leading-[1.2] text-[#242424] md:text-[40px] md:leading-[48px]">חנות</h1>
 </div>
 <div className="mx-auto max-w-[1600px] px-[15px] pt-[50px]">
 <div className="mb-[35px] hidden grid-cols-5 gap-x-[20px] md:grid">
 {Array.from({ length: 5 }, (_, i) => (
 <div key={i} className="h-[42px] border-b-2 border-black/10" />
 ))}
 </div>
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
 {Array.from({ length: 10 }, (_, i) => (
 <CardSkeleton key={i} />
 ))}
 </div>
 </div>
 </div>
 );
}
