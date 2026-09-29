import type { Metadata } from "next";
import { getSecretClubPage } from "@/lib/wpgraphql/tamarApi";
import { RichContent } from "@/components/ui/RichContent";
import { ClubSignup } from "@/components/home/ClubSignup";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getSecretClubPage();
  return { title: page?.heading || "הנבחרת הסודית" };
}

// Public path is the Hebrew "/הנבחרת-הסודית" (see the rewrite in
// next.config.ts) — same reason /brand-list exists for "/מותג/".
export default async function SecretClubPage() {
  const page = await getSecretClubPage();

  const heading = page?.heading ?? "";
  const contentHtml = page?.contentHtml ?? "";
  const columns = (page?.columns ?? []).filter((c) => c.title || c.text);
  const ctaHeading = page?.ctaHeading ?? "";
  const ctaDescription = page?.ctaDescription ?? "";
  const ctaImage = page?.ctaImage ?? null;
  const ctaCheckboxLabel = page?.ctaCheckboxLabel ?? "";
  const ctaButtonLabel = page?.ctaButtonLabel ?? "";

  return (
    <div>
      <div className="border-b border-black/5 bg-gradient-to-br from-brand-soft/60 via-brand-soft/20 to-white">
        <div className="mx-auto max-w-[1600px] px-[15px] py-6 text-center sm:py-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-accent sm:text-5xl lg:text-[50px] lg:leading-[50px]">{heading}</h1>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-[15px] py-10">
        {/* Reference site: Open Sans 400, 21px/34px, rgb(12,12,12). */}
        {contentHtml ? (
          <RichContent
            html={contentHtml}
            className="mx-auto max-w-none text-center !text-black !text-[21px] !leading-[34px]"
          />
        ) : null}

        {columns.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {/* Odd columns (1, 3) in the brand color, even columns (2, 4) in
                black — heading and body text share the same color within
                each column. Reference site: both are Open Sans Hebrew 400,
                19px/30px (not bold). */}
            {columns.map((col, i) => {
              const colorClass = i % 2 === 0 ? "text-brand-accent" : "text-black";
              return (
                <div key={i} className="text-center sm:text-start">
                  {col.title ? <h3 className={`mb-2 text-[19px] font-normal leading-[30px] ${colorClass}`}>{col.title}</h3> : null}
                  {col.text ? <p className={`text-[19px] leading-[30px] whitespace-pre-line ${colorClass}`}>{col.text}</p> : null}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      <ClubSignup
        heading={ctaHeading || undefined}
        description={ctaDescription || undefined}
        bgImageUrl={ctaImage?.url}
        checkboxLabel={ctaCheckboxLabel || undefined}
        buttonLabel={ctaButtonLabel || undefined}
      />
    </div>
  );
}
