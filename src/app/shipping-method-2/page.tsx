import { ContentPage, contentMetadata } from "@/components/ui/ContentPageView";

export const revalidate = 300;

const ROUTE = "shipping-method-2-page";
const FALLBACK_TITLE = "תנאי אחריות מוצרי חשמל";

export const generateMetadata = () => contentMetadata(ROUTE, FALLBACK_TITLE);

// Public path is the Hebrew "/שיטת-שילוח-תמר-קוסמטיקס-2" (matching the live site) — see the
// rewrite in next.config.ts.
export default function Page() {
  return <ContentPage route={ROUTE} fallbackTitle={FALLBACK_TITLE} profile="warranty" />;
}
