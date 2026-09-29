import { MyAccountPanels } from "@/components/auth/MyAccountPanels";

interface MyAccountPageProps {
  searchParams: Promise<{ action?: string }>;
}

export default async function MyAccountPage({ searchParams }: MyAccountPageProps) {
  const { action } = await searchParams;
  const initialMode = action === "register" ? "register" : "login";

  return <MyAccountPanels initialMode={initialMode} />;
}
