export default function WholesaleLoading() {
 return (
 <div className="animate-pulse">
 <div className="border-b border-black/5 bg-gradient-to-br from-brand-soft/60 via-brand-soft/20 to-white">
 <div className="mx-auto max-w-[1600px] px-[15px] py-8 text-center sm:py-10">
 <div className="mx-auto h-9 w-2/3 max-w-lg rounded-full bg-black/10" />
 </div>
 </div>

 <div className="mx-auto max-w-[1600px] px-[15px] py-10 ">
 <div className="mx-auto flex max-w-3xl flex-col items-center gap-3">
 <div className="h-4 w-full rounded-full bg-black/5" />
 <div className="h-4 w-5/6 rounded-full bg-black/5" />
 <div className="h-4 w-2/3 rounded-full bg-black/5" />
 </div>
 </div>

 <div className="bg-brand-soft/20 py-10 sm:py-14">
 <div className="mx-auto grid max-w-[1600px] items-center gap-10 px-[15px] lg:grid-cols-2 lg:gap-14">
 <div className="mx-auto h-96 w-full max-w-lg rounded-[2rem] bg-white/60" />
 <div className="mx-auto aspect-[4/5] w-full max-w-lg rounded-3xl bg-black/5" />
 </div>
 </div>

 <div className="mx-auto max-w-[1600px] px-[15px] py-10 sm:py-14">
 <div className="flex gap-4 overflow-hidden">
 {Array.from({ length: 3 }, (_, i) => (
 <div key={i} className="aspect-[4/3] w-[calc((100%-2rem)/3)] shrink-0 rounded-2xl bg-black/5" />
 ))}
 </div>
 </div>
 </div>
 );
}
