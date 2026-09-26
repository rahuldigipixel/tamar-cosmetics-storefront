export default function BlogPostLoading() {
 return (
 <div className="mx-auto max-w-[1600px] animate-pulse px-[15px] py-8 sm:py-10">
 <div className="h-4 w-28 rounded-full bg-black/10" />
 <div className="mt-4 h-9 w-5/6 max-w-2xl rounded-full bg-black/10" />
 <div className="mt-3 h-4 w-40 rounded-full bg-black/5" />
 <div className="mt-6 aspect-[21/9] w-full rounded-2xl bg-black/5" />
 <div className="mx-auto mt-8 flex flex-col gap-3">
 {Array.from({ length: 5 }, (_, i) => (
 <div key={i} className="h-4 w-full rounded-full bg-black/5" />
 ))}
 </div>
 </div>
 );
}
