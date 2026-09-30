import { redirect } from "next/navigation";

export default function LegacyAddressPage() {
  redirect("/my-account/edit-address");
}
