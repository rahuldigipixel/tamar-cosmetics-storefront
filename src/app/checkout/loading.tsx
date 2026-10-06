export default function CheckoutLoading() {
  return (
    <div className="mx-auto max-w-[1115px] animate-pulse px-[25px] pb-[60px] pt-[50px]" aria-busy="true">
      <div className="h-[19px] w-[211px] rounded bg-black/5" />
      <div className="mt-[25px] h-[19px] w-[228px] rounded bg-black/5" />
      <div className="mt-[25px] grid grid-cols-1 gap-[29px] min-[1025px]:grid-cols-2">
        <div>
          <div className="h-[90px] bg-black/5" />
          <div className="mt-[30px] h-[31px] w-[120px] rounded bg-black/5" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="mt-[20px] h-[42px] rounded-[35px] bg-black/5" />
          ))}
        </div>
        <div className="h-[560px] bg-black/5" />
      </div>
    </div>
  );
}
