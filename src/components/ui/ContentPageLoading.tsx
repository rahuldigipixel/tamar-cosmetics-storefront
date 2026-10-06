export default function ContentPageLoading() {
  return (
    <div className="animate-pulse">
      <div className="bg-[#fde7eb]">
        <div className="mx-auto max-w-[1600px] px-[15px] py-5 text-center">
          <div className="mx-auto h-9 w-2/3 max-w-lg rounded-full bg-black/10" />
        </div>
      </div>
      <div className="mx-auto max-w-[1570px] px-[25px] py-10">
        <div className="flex flex-col gap-3">
          <div className="h-4 w-full rounded-full bg-black/5" />
          <div className="h-4 w-5/6 rounded-full bg-black/5" />
          <div className="h-4 w-2/3 rounded-full bg-black/5" />
        </div>
      </div>
    </div>
  );
}
