import { ContentPage, contentMetadata } from "@/components/ui/ContentPageView";

export const revalidate = 300;

const ROUTE = "jerusalem-delivery-page";
const FALLBACK_TITLE = "מדיניות משלוחים בירושלים מ-'היום להיום'";

export const generateMetadata = () => contentMetadata(ROUTE, FALLBACK_TITLE);

// Public path is the Hebrew "/שירות-משלוחים-בירושלים-מהיום-להיום" (matching the live site) — see the
// rewrite in next.config.ts.
export default function Page() {
  return <ContentPage route={ROUTE} fallbackTitle={FALLBACK_TITLE} profile="centered" />;
}
