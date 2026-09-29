export default function SecretClubLoading() {
  return (
    <div className="animate-pulse">
      <div className="border-b border-black/5 bg-gradient-to-br from-brand-soft/60 via-brand-soft/20 to-white">
        <div className="mx-auto max-w-[1600px] px-[15px] py-8 text-center sm:py-10">
          <div className="mx-auto h-9 w-2/3 max-w-lg rounded-full bg-black/10" />
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-[15px] py-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3">
          <div className="h-4 w-full rounded-full bg-black/5" />
          <div className="h-4 w-5/6 rounded-full bg-black/5" />
          <div className="h-4 w-2/3 rounded-full bg-black/5" />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="h-5 w-2/3 rounded-full bg-black/10" />
              <div className="h-4 w-full rounded-full bg-black/5" />
              <div className="h-4 w-4/5 rounded-full bg-black/5" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid w-full lg:grid-cols-[45%_55%]">
        <div className="min-h-[380px] bg-[#d52027]/80 sm:min-h-[480px] lg:min-h-[640px]" />
        <div className="min-h-[380px] bg-black/5 sm:min-h-[480px] lg:min-h-[640px]" />
      </div>
    </div>
  );
}
