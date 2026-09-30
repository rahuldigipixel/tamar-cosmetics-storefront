export default function SearchLoading() {
  return (
    <div className="animate-pulse">
      <div className="bg-[#fde7eb] px-[15px] py-[15px]">
        <div className="mx-auto h-[40px] w-64 rounded-full bg-black/10" />
      </div>
      <div className="mx-auto max-w-[1600px] px-[15px] pt-[30px] pb-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="border border-black/5 p-4">
              <div className="aspect-square w-full bg-black/5" />
              <div className="mt-4 h-4 w-full rounded-full bg-black/5" />
              <div className="mt-2 h-4 w-1/2 rounded-full bg-black/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
