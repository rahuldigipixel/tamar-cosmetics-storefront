import { OrderDetails } from "@/components/auth/OrderDetails";

export default async function ViewOrderPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  return <OrderDetails number={number} />;
}
