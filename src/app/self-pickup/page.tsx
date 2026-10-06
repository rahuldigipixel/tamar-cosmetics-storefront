import { ContentPage, contentMetadata } from "@/components/ui/ContentPageView";

export const revalidate = 300;

const ROUTE = "self-pickup-page";
const FALLBACK_TITLE = "שירות איסוף עצמי";

export const generateMetadata = () => contentMetadata(ROUTE, FALLBACK_TITLE);

// Public path is the Hebrew "/שירות-איסוף-עצמי" (matching the live site) — see the
// rewrite in next.config.ts.
export default function Page() {
  return <ContentPage route={ROUTE} fallbackTitle={FALLBACK_TITLE} profile="pickup" />;
}
