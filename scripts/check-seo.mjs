// Build step 4. Audits the finished site and fails the build if any search
// metadata is missing or broken, so a future edit can't silently hurt ranking.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
try {
  process.loadEnvFile?.(path.join(root, ".env"));
} catch {
  /* fine */
}
const { SITE_URL, person } = await import(pathToFileURL(path.join(root, "src/data/profile.js")).href);
const dist = path.join(root, "dist");
const html = fs.readFileSync(path.join(dist, "index.html"), "utf8");
const name = person.fullName;
const errors = [];
const warnings = [];
const passed = [];
const check = (ok, msg, level = "error") => (ok ? passed.push(msg) : (level === "error" ? errors : warnings).push(msg));
const tag = (re) => html.match(re)?.[1];
const metaName = (n) => tag(new RegExp(`<meta name="${n.replace(".", "\\.")}" content="([^"]*)"`));
const metaProp = (p) => tag(new RegExp(`<meta property="${p}" content="([^"]*)"`));
const decode = (s = "") => s.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

const title = decode(tag(/<title>([^<]*)<\/title>/));
check(!!title, "Page has a <title>");
check(title?.startsWith(name), "Title starts with your full name");
check(title && title.length <= 60, `Title fits in Google results (${title?.length} of 60 characters)`, "warning");
check((html.match(/<title>/g) || []).length === 1, "Exactly one <title>");

const desc = decode(metaName("description"));
check(!!desc && desc.includes(name), "Meta description contains your full name");
check(desc && desc.length >= 120 && desc.length <= 160, `Meta description length is ideal (${desc?.length} of 120 to 160)`, "warning");

check(tag(/<link rel="canonical" href="([^"]*)"/) === `${SITE_URL}/`, `Canonical URL is ${SITE_URL}/`);
check(/^https:\/\//.test(SITE_URL), "Site URL uses https");
check(/index, follow/.test(metaName("robots") || ""), "Robots meta allows indexing");
check(/max-image-preview:large/.test(metaName("robots") || ""), "Large image previews allowed");
check(/<html lang="en"/.test(html), "Page language is declared");
check(!html.includes("__SITE_URL__") && !html.includes("<!--seo-head-->") && !html.includes("<!--json-ld-->"), "No unfilled placeholders");

for (const p of ["og:type", "og:title", "og:description", "og:url", "og:image", "og:image:alt", "og:site_name", "profile:first_name", "profile:last_name"]) {
  check(!!metaProp(p), `Open Graph ${p} present`);
}
for (const n of ["twitter:card", "twitter:title", "twitter:description", "twitter:image", "twitter:image:alt"]) check(!!metaName(n), `${n} present`);
const og = metaProp("og:image") || "";
check(og.startsWith(SITE_URL) && fs.existsSync(path.join(dist, og.slice(SITE_URL.length))), "Share image exists in the build");
check(!!metaName("google-site-verification"), "Google Search Console verification tag set (add GOOGLE_SITE_VERIFICATION)", "warning");

const h1s = html.match(/<h1[\s\S]*?<\/h1>/g) || [];
const h1Text = h1s[0]?.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
check(h1s.length === 1, "Exactly one <h1>");
check(h1Text === name, `<h1> is your full name ("${h1Text}")`);

const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
const missingAlt = imgs.filter((i) => !/\balt="/.test(i));
check(missingAlt.length === 0, `Every image has alt text (${imgs.length} images)`);
const contentImgs = imgs.filter((i) => !/\balt=""/.test(i));
const named = contentImgs.filter((i) => i.includes(name));
check(named.length === contentImgs.length, `Every content image's alt text includes your name (${named.length} of ${contentImgs.length}; tech logos are decorative)`);

const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
check(blocks.length === 1, "One structured-data block");
let graph = [];
try {
  graph = JSON.parse(blocks[0][1])["@graph"];
  passed.push("Structured data is valid JSON");
} catch (e) {
  errors.push(`Structured data is not valid JSON: ${e.message}`);
}
const types = graph.map((n) => n["@type"]);
for (const t of ["WebSite", "ProfilePage", "Person", "ImageObject", "ItemList"]) check(types.includes(t), `Structured data includes ${t}`);
const personNode = graph.find((n) => n["@type"] === "Person") || {};
check(personNode.name === name, "Person name matches your full name");
check((personNode.alternateName || []).includes("Flourish Okafor"), "Person lists 'Flourish Okafor' as an alternate name");
check((personNode.sameAs || []).length >= 1, `Person links your other profiles (${(personNode.sameAs || []).length} sameAs links)`);
check(personNode.homeLocation?.address?.addressLocality === person.location.locality, `Person home location is ${person.location.text}`);
const visibleText = html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ");
check(visibleText.includes(`${person.location.locality}, ${person.location.region}`), "Location is visible in the page text");
check(desc?.includes(person.location.locality), "Meta description mentions your town");
const ids = new Set(graph.map((n) => n["@id"]).filter(Boolean));
const refs = [...JSON.stringify(graph).matchAll(/\{"@id":"([^"]+)"\}/g)].map((m) => m[1]);
const dangling = refs.filter((r) => !ids.has(r));
check(dangling.length === 0, `All structured-data links resolve (${refs.length} references)`);

const robots = fs.readFileSync(path.join(dist, "robots.txt"), "utf8");
check(robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`), "robots.txt points to the sitemap");
const sitemap = fs.readFileSync(path.join(dist, "sitemap.xml"), "utf8");
check(sitemap.includes(`<loc>${SITE_URL}/</loc>`), "Sitemap lists the home page");
const sitemapImgs = [...sitemap.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map((m) => m[1]);
const missingImgs = sitemapImgs.filter((u) => !fs.existsSync(path.join(dist, u.slice(SITE_URL.length))));
check(missingImgs.length === 0, `All ${sitemapImgs.length} sitemap images exist`);
for (const f of ["humans.txt", "llms.txt", "404.html", "site.webmanifest", "favicon.svg", "apple-touch-icon.png"]) {
  check(fs.existsSync(path.join(dist, f)), `${f} present`);
}
check(/noindex/.test(fs.readFileSync(path.join(dist, "404.html"), "utf8")), "404 page is excluded from search");

console.log(`\nSEO check: ${passed.length} passed, ${warnings.length} warnings, ${errors.length} errors`);
for (const w of warnings) console.log(`  ⚠ ${w}`);
for (const e of errors) console.log(`  ✗ ${e}`);
if (errors.length) process.exit(1);
