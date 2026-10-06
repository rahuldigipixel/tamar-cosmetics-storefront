import { ContentPage, contentMetadata } from "@/components/ui/ContentPageView";

export const revalidate = 300;

const ROUTE = "credit-card-payments-page";
const FALLBACK_TITLE = "תשלומים בכרטיס אשראי";

export const generateMetadata = () => contentMetadata(ROUTE, FALLBACK_TITLE);

// Public path is the Hebrew "/תשלומים-בכרטיס-אשראי-2" (matching the live site) — see the
// rewrite in next.config.ts.
export default function Page() {
  return <ContentPage route={ROUTE} fallbackTitle={FALLBACK_TITLE} profile="creditCard" />;
}
