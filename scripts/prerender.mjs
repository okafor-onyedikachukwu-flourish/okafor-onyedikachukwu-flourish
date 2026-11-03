// Build step 3. Turns the React app into real HTML that search engines read
// instantly, and writes every piece of search metadata from src/data/profile.js:
// the <head> tags, structured data, sitemap.xml, robots.txt, humans.txt,
// llms.txt and 404.html.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
try {
  process.loadEnvFile?.(path.join(root, ".env"));
} catch {
  /* no .env: use real environment variables */
}

const { SITE_URL, person, projects, archive, seo, stack } = await import(pathToFileURL(path.join(root, "src/data/profile.js")).href);
const { render } = await import(pathToFileURL(path.join(root, "dist-ssr/entry-server.js")).href);

const dist = path.join(root, "dist");
const today = new Date().toISOString().slice(0, 10);
const year = today.slice(0, 4);
const abs = (p) => (p?.startsWith("http") ? p : `${SITE_URL}${p}`);
const attr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const xml = attr;
const id = (frag) => `${SITE_URL}/#${frag}`;
const HOME = `${SITE_URL}/`;
const ogImage = abs(person.ogImage);

// ---------------------------------------------------------------- <head> tags
const meta = (name, content) => `<meta name="${name}" content="${attr(content)}" />`;
const prop = (property, content) => `<meta property="${property}" content="${attr(content)}" />`;
const verify = [
  ["google-site-verification", process.env.GOOGLE_SITE_VERIFICATION],
  ["msvalidate.01", process.env.BING_SITE_VERIFICATION],
  ["yandex-verification", process.env.YANDEX_SITE_VERIFICATION]
].filter(([, v]) => v);
const handle = process.env.X_HANDLE ? `@${process.env.X_HANDLE.replace(/^@/, "")}` : null;

const headTags = [
  `<title>${attr(seo.title)}</title>`,
  meta("description", seo.description),
  meta("keywords", seo.keywords.join(", ")),
  meta("author", person.fullName),
  meta("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"),
  `<link rel="canonical" href="${HOME}" />`,
  `<link rel="me" href="${attr(person.github)}" />`,
  `<link rel="author" type="text/plain" href="/humans.txt" />`,
  `<link rel="sitemap" type="application/xml" href="/sitemap.xml" />`,
  meta("application-name", person.fullName),
  meta("apple-mobile-web-app-title", person.givenName),
  meta("format-detection", "telephone=no"),
  ...verify.map(([name, value]) => meta(name, value)),

  prop("og:type", "profile"),
  prop("og:locale", "en_NG"),
  prop("og:site_name", person.fullName),
  prop("og:title", seo.socialTitle),
  prop("og:description", seo.socialDescription),
  prop("og:url", HOME),
  prop("og:image", ogImage),
  prop("og:image:secure_url", ogImage),
  prop("og:image:type", "image/jpeg"),
  prop("og:image:width", "1200"),
  prop("og:image:height", "630"),
  prop("og:image:alt", seo.socialImageAlt),
  prop("profile:first_name", person.givenName),
  prop("profile:last_name", person.familyName),
  prop("profile:username", "Flourish1-bit"),

  meta("twitter:card", "summary_large_image"),
  meta("twitter:title", seo.socialTitle),
  meta("twitter:description", seo.socialDescription),
  meta("twitter:image", ogImage),
  meta("twitter:image:alt", seo.socialImageAlt),
  ...(handle ? [meta("twitter:site", handle), meta("twitter:creator", handle)] : [])
].join("\n    ");

// --------------------------------------------------------- structured data
// One connected graph: the website, the profile page, you (the Person), your
// portraits, your occupations and every project, all linked by @id.
const portrait = (key, frag) => {
  const p = person.portraits[key];
  return {
    "@type": "ImageObject",
    "@id": id(frag),
    url: abs(`${p.base}.jpg`),
    contentUrl: abs(`${p.base}.jpg`),
    width: p.width,
    height: p.height,
    caption: p.alt,
    name: p.alt,
    creditText: person.fullName,
    representativeOfPage: key === "hero",
    inLanguage: "en"
  };
};

const projectNodes = projects.map((p) => ({
  "@type": "CreativeWork",
  "@id": id(`project-${p.slug}`),
  name: p.name,
  headline: p.summary,
  description: p.description,
  url: p.live || p.repo,
  ...(p.live && p.repo ? { sameAs: p.repo } : {}),
  image: p.image ? abs(p.image.lg) : p.remoteImage,
  keywords: p.tags.join(", "),
  dateCreated: String(p.year),
  inLanguage: "en",
  isAccessibleForFree: true,
  creator: { "@id": id("person") },
  author: { "@id": id("person") }
}));

const graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": id("website"),
      url: HOME,
      name: person.fullName,
      alternateName: person.alternateNames,
      description: seo.description,
      inLanguage: "en",
      publisher: { "@id": id("person") },
      copyrightHolder: { "@id": id("person") },
      copyrightYear: Number(year),
      about: { "@id": id("person") }
    },
    {
      "@type": "ProfilePage",
      "@id": id("profilepage"),
      url: HOME,
      name: seo.title,
      description: seo.description,
      isPartOf: { "@id": id("website") },
      mainEntity: { "@id": id("person") },
      about: { "@id": id("person") },
      primaryImageOfPage: { "@id": id("portrait-hero") },
      dateCreated: seo.datePublished,
      datePublished: seo.datePublished,
      dateModified: today,
      inLanguage: "en"
    },
    {
      "@type": "Person",
      "@id": id("person"),
      name: person.fullName,
      alternateName: person.alternateNames,
      givenName: person.givenName,
      additionalName: person.additionalName,
      familyName: person.familyName,
      url: HOME,
      image: [{ "@id": id("portrait-hero") }, { "@id": id("portrait-about") }],
      description: `${person.fullName} is a ${person.age}-year-old full-stack developer, graphic designer and AI developer based in ${person.location.text}. He builds AI agents, React and Next.js web apps and brand identities.`,
      disambiguatingDescription: `${person.age}-year-old full-stack developer, graphic designer and AI developer from ${person.location.text}; creator of FlorScene.Agent and OmniDesk Local.`,
      homeLocation: {
        "@type": "Place",
        name: person.location.text,
        sameAs: person.location.wikipedia,
        address: {
          "@type": "PostalAddress",
          addressLocality: person.location.locality,
          addressRegion: person.location.region,
          addressCountry: person.location.countryCode
        }
      },
      jobTitle: person.roles,
      hasOccupation: person.occupations.map((o) => ({
        "@type": "Occupation",
        name: o.name,
        occupationalCategory: {
          "@type": "CategoryCode",
          codeValue: o.code,
          name: o.codeName,
          inCodeSet: { "@type": "CategoryCodeSet", name: "O*NET-SOC" }
        },
        skills: o.skills.join(", ")
      })),
      knowsAbout: person.knowsAbout.map((k) => (k.sameAs ? { "@type": "Thing", name: k.name, sameAs: k.sameAs } : k.name)),
      sameAs: [person.github, ...archive.map((a) => a.href)],
      workExample: projectNodes.map((p) => ({ "@id": p["@id"] })),
      mainEntityOfPage: { "@id": id("profilepage") }
    },
    portrait("hero", "portrait-hero"),
    portrait("about", "portrait-about"),
    ...projectNodes,
    {
      "@type": "ItemList",
      "@id": id("projects"),
      name: `Projects by ${person.fullName}`,
      numberOfItems: projectNodes.length,
      itemListElement: projectNodes.map((p, i) => ({ "@type": "ListItem", position: i + 1, item: { "@id": p["@id"] } }))
    }
  ]
};
const jsonLd = `<script type="application/ld+json">${JSON.stringify(graph).replace(/</g, "\\u003c")}</script>`;

// ------------------------------------------------------------- index.html
let html = await fs.readFile(path.join(dist, "index.html"), "utf8");
html = html
  .replace(/<title>[^<]*<\/title>\s*/, "")
  .replace("<!--seo-head-->", headTags)
  .replace("<!--json-ld-->", jsonLd)
  .replace("<!--app-html-->", render());
await fs.writeFile(path.join(dist, "index.html"), html);

// ---------------------------------------------------------- sitemap.xml
// Image entries help your portraits and project shots appear in Google Images.
// (Only image:loc is used: Google retired image:title and image:caption.)
const imageUrls = [
  abs(`${person.portraits.hero.base}.jpg`),
  abs(`${person.portraits.about.base}.jpg`),
  ogImage,
  ...projects.filter((p) => p.image).map((p) => abs(p.image.lg))
];
await fs.writeFile(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${xml(HOME)}</loc>
    <lastmod>${today}</lastmod>
${imageUrls.map((u) => `    <image:image><image:loc>${xml(u)}</image:loc></image:image>`).join("\n")}
  </url>
</urlset>
`
);

// ------------------------------------------------------------ robots.txt
await fs.writeFile(path.join(dist, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

// ------------------------------------------------------------ humans.txt
await fs.writeFile(
  path.join(dist, "humans.txt"),
  `/* TEAM */
Designer, developer and AI developer: ${person.fullName}
Also known as: ${person.alternateNames.join(", ")}
Location: ${person.location.text}
GitHub: ${person.github}

/* SITE */
Last update: ${today}
Language: English
Standards: HTML5, CSS3, schema.org, Open Graph
Components: React, Vite, Node.js, Express, Gemini API
`
);

// --------------------------------------------------------------- llms.txt
// An emerging convention that helps AI search tools (ChatGPT search,
// Perplexity, Claude) describe you accurately. Google doesn't use it.
const allTools = stack.flatMap((g) => g.items.map((i) => i.name)).join(", ");
await fs.writeFile(
  path.join(dist, "llms.txt"),
  `# ${person.fullName}

> ${person.fullName} (also known as ${person.alternateNames.slice(0, 2).join(" and ")}) is a ${person.age}-year-old full-stack developer, graphic designer and AI developer based in ${person.location.text}. Portfolio: ${HOME}

${person.bio.join("\n\n")}

## Projects

${projects.map((p) => `- [${p.name}](${p.live || p.repo}): ${p.summary} ${p.description}`).join("\n")}

## Tools

${allTools}

## Links

- [Portfolio](${HOME})
- [GitHub](${person.github})
`
);

// --------------------------------------------------------------- 404.html
const notFound = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Page not found | ${attr(person.fullName)}</title><link rel="icon" href="/favicon.svg" type="image/svg+xml"><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0f1328;color:#f1eadc;font:16px/1.6 system-ui,sans-serif;text-align:center;padding:2rem}a{color:#e8b65a;font-weight:700}h1{font-size:2rem;margin:0 0 .5rem}</style></head><body><main><h1>This page doesn’t exist</h1><p>The link may be old. Everything lives on the home page.</p><p><a href="/">Go to ${attr(person.fullName)}’s portfolio</a></p></main></body></html>`;
await fs.writeFile(path.join(dist, "404.html"), notFound);

await fs.rm(path.join(root, "dist-ssr"), { recursive: true, force: true });
console.log(`Prerendered for ${SITE_URL}: ${graph["@graph"].length} structured-data nodes, ${imageUrls.length} sitemap images, robots.txt, humans.txt, llms.txt, 404.html`);
