export default function TermsLoading() {
  return (
    <div className="animate-pulse">
      <div className="border-b border-black/5 bg-gradient-to-br from-brand-soft/60 via-brand-soft/20 to-white">
        <div className="mx-auto max-w-[1600px] px-[15px] py-8 text-center">
          <div className="mx-auto h-9 w-2/3 max-w-lg rounded-full bg-black/10" />
        </div>
      </div>
      <div className="mx-auto max-w-[1600px] px-[15px] py-10">
        <div className="flex flex-col gap-3">
          <div className="h-4 w-full rounded-full bg-black/5" />
          <div className="h-4 w-5/6 rounded-full bg-black/5" />
          <div className="h-4 w-2/3 rounded-full bg-black/5" />
        </div>
      </div>
    </div>
  );
}
