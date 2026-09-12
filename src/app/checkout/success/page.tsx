interface SuccessPageProps {
  searchParams: Promise<{ order?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { order } = await searchParams;

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
      <h1 className="text-2xl font-bold">תודה על ההזמנה!</h1>
      <p className="mt-3 text-black/70">מספר הזמנה: {order}</p>
    </div>
  );
}
