export default function ReviewsLoading() {
 return (
 <div className="animate-pulse">
 <div className="border-b border-black/5 bg-gradient-to-br from-brand-soft/60 via-brand-soft/20 to-white">
 <div className="mx-auto max-w-[1600px] px-[15px] py-8 text-center sm:py-10">
 <div className="mx-auto h-9 w-2/3 max-w-lg rounded-full bg-black/10" />
 </div>
 </div>

 <div className="mx-auto max-w-[1600px] px-[15px] py-10 ">
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
 {Array.from({ length: 6 }, (_, i) => (
 <div key={i} className="h-40 rounded-2xl bg-black/5" />
 ))}
 </div>
 </div>
 </div>
 );
}
