import { jsonLdString } from "@/lib/seo";

/** Renders one or more JSON-LD entities (see pageJsonLd/breadcrumbJsonLd in lib/seo.ts). */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(data) }} />;
}
