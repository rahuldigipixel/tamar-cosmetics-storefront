import type { Metadata } from "next";

// Private or transactional pages: never indexed (also disallowed in robots.txt).
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
