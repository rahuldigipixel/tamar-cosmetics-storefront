import { EditAccountForm } from "@/components/auth/EditAccountForm";

export default async function EditAccountPage({ searchParams }: { searchParams: Promise<{ newuseremail?: string }> }) {
  const { newuseremail } = await searchParams;
  return <EditAccountForm confirmHash={newuseremail} />;
}
