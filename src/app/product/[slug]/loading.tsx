export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-[1400px] animate-pulse px-4 py-8 sm:px-6">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square w-full rounded-2xl bg-black/5" />

        <div className="text-right">
          <div className="ms-auto h-8 w-3/4 rounded-full bg-black/5" />
          <div className="ms-auto mt-4 h-7 w-32 rounded-full bg-black/5" />
          <div className="ms-auto mt-6 h-4 w-full rounded-full bg-black/5" />
          <div className="ms-auto mt-2 h-4 w-5/6 rounded-full bg-black/5" />
          <div className="ms-auto mt-2 h-4 w-2/3 rounded-full bg-black/5" />
          <div className="mt-6 flex justify-end gap-3">
            <div className="h-12 w-40 rounded-full bg-black/5" />
            <div className="h-12 w-12 rounded-full bg-black/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
