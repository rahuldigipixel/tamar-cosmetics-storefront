// Prints the SEO tags a crawler sees for each storefront URL.
//   node scripts/check-seo.mjs                       -> checks the default set against http://localhost:3000
//   node scripts/check-seo.mjs http://localhost:3000 /product/foo /product-category/sale/
// Exits 1 if a page is missing a title, description, canonical, og:title or og:image, or has duplicate tags.
const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const paths = process.argv.slice(3);
const targets = paths.length ? paths : ["/", "/product-category/sale/", "/brand/acrylic-pro-tamar-cosmetics/", "/robots.txt", "/sitemap.xml"];

const attr = (tag, name) => tag.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`, "i"))?.[1] ?? "";
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

let failed = false;
for (const path of targets) {
  const t0 = Date.now();
  const res = await fetch(base + path, { redirect: "follow" });
  const body = await res.text();
  const ms = Date.now() - t0;
  console.log(`\n=== ${path}  ${res.status}  ${ms}ms  ${(body.length / 1024).toFixed(0)}KB`);
  if (/robots\.txt|sitemap\.xml/.test(path)) {
    console.log(body.split("\n").slice(0, 12).join("\n"));
    if (path.endsWith("sitemap.xml")) console.log(`  <url> entries: ${(body.match(/<url>/g) ?? []).length}`);
    continue;
  }
  // Next streams metadata for routes behind a loading.tsx into <body> (hoisted to <head> by the browser), so scan the whole document.
  const head = body;
  const metas = [...head.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]);
  const meta = (key) => metas.filter((m) => attr(m, "name") === key || attr(m, "property") === key).map((m) => decode(attr(m, "content")));
  const titles = [...head.matchAll(/<title>([^<]*)<\/title>/gi)].map((m) => decode(m[1]));
  const canonicals = [...head.matchAll(/<link\b[^>]*rel="canonical"[^>]*>/gi)].map((m) => attr(m[0], "href"));
  const ld = [...body.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap((m) => {
    try {
      const j = JSON.parse(m[1]);
      return (Array.isArray(j) ? j : [j]).map((x) => x["@type"]);
    } catch {
      failed = true;
      return ["INVALID JSON"];
    }
  });
  const rows = {
    title: titles,
    description: meta("description"),
    robots: meta("robots"),
    canonical: canonicals,
    "og:title": meta("og:title"),
    "og:image": meta("og:image"),
    "og:url": meta("og:url"),
    "twitter:card": meta("twitter:card"),
    "json-ld": ld,
  };
  for (const [k, v] of Object.entries(rows)) console.log(`  ${k.padEnd(13)} ${v.length ? v.join("  |  ") : "-"}`);
  const problems = [];
  if (titles.length !== 1) problems.push(`title x${titles.length}`);
  if (!rows.description.length) problems.push("no description");
  if (canonicals.length !== 1) problems.push(`canonical x${canonicals.length}`);
  if (!rows["og:title"].length) problems.push("no og:title");
  if (!rows["og:image"].length) problems.push("no og:image");
  if (problems.length) {
    failed = true;
    console.log(`  !! ${problems.join(", ")}`);
  }
}
process.exit(failed ? 1 : 0);
