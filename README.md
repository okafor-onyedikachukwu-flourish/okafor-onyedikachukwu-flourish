# Okafor Onyedikachukwu Flourish: Portfolio and Full Stack AI Machine

The portfolio of **Okafor Onyedikachukwu Flourish**, a 14-year-old full-stack developer, graphic designer and AI developer.

- **Frontend:** React 18 + Vite. Prerendered to static HTML at build time, so Google reads the full page instantly.
- **Backend:** Node.js. The same code runs as an Express server locally and as Vercel serverless functions in production.
- **AI Machine:** visitors ask questions about Flourish's work, and answers stream back word by word. It uses Gemini when you add an API key, and a built-in offline engine when you don't.
- **Background:** a neural-network animation on one `<canvas>`, tuned so it doesn't hurt PageSpeed.

## Run it on your computer

You need Node.js 20.12 or newer.

```bash
npm install
cp .env.example .env      # then edit .env if you like
npm run dev               # site: http://localhost:5173  (API runs on :8787)
```

To test the real production build: `npm run preview`, then open http://localhost:8787.

## Where things live

```
src/data/profile.js        ← EDIT THIS: your bio, projects, links, stack (one file feeds everything)
src/components/            ← React sections (Hero, Work, Machine, Stack, About...)
src/components/NeuralBackground.jsx  ← the canvas animation
src/styles/global.css      ← design tokens (colors, type) and all styles
public/assets/images/      ← your portraits, project screenshots, share card
server/core/               ← AI pipeline, Gemini + offline engines, metrics, rate limit
server/index.js            ← Express server (local / Render / Railway)
api/                       ← the same endpoints as Vercel functions
scripts/prerender.mjs      ← writes SEO HTML, structured data, sitemap.xml, robots.txt
```

### API endpoints

| Method | Path | What it does |
|---|---|---|
| GET | `/api/health` | Engine in use (Gemini or offline) |
| GET | `/api/projects` | All projects as JSON |
| GET | `/api/metrics/stream` | Live server vitals (server-sent events, every second) |
| POST | `/api/chat` | `{ "messages": [{ "role": "user", "content": "..." }] }` → streamed answer |

## Put it online with Vercel

1. Create a new GitHub repo (for example `Flourish1-bit/okafor-onyedikachukwu-flourish`) and push this folder to it.
2. In Vercel, click **Add New → Project** and import the repo. Name the project **okafor-onyedikachukwu-flourish**, so your address becomes `okafor-onyedikachukwu-flourish.vercel.app`.
3. Under **Environment Variables**, add:
   - `SITE_URL` = your final address, for example `https://okafor-onyedikachukwu-flourish.vercel.app`
   - `GEMINI_API_KEY` (optional), a free key from aistudio.google.com
4. Deploy. `vercel.json` already sets the build, the API functions, caching and security headers.

If you use a different address, change `SITE_URL` and redeploy. The canonical link, sitemap and share cards all come from it.

## Getting Google to rank you for your name

All metadata is generated from the `seo` and `person` blocks in `src/data/profile.js`. Edit it there and every tag updates on the next build.

**In the page head:** a 58-character title that starts with your full name, and a 159-character description that includes "Flourish Okafor". Also a canonical URL, robots rules allowing large image previews, keywords (ignored by Google, still read by Bing), `rel="me"` linking your GitHub, and verification tags for Google, Bing and Yandex. Full Open Graph and Twitter/X cards (profile type with first name, last name and username, and a 1200×630 image with alt text) control previews on WhatsApp, LinkedIn, X, Facebook and Discord.

**Structured data:** one connected schema.org graph with 15 nodes:
- **WebSite** with your name and alternate names (Google uses this for the site name in results)
- **ProfilePage** with created and modified dates
- **Person** with all spellings of your name, your home town (Nsukka, Enugu State, Nigeria, linked to its Wikipedia page), three occupations with official O*NET job codes, and skills linked to their Wikipedia topics so Google knows exactly what you work on
- **Both portraits** as ImageObjects with credit text
- **All 9 projects**, each linked back to you as creator

**Files for crawlers:** `sitemap.xml` with 11 images for Google Images, `robots.txt`, `humans.txt`, and `llms.txt` (helps AI search tools like ChatGPT search and Perplexity describe you correctly). API responses carry `noindex`, and the 404 page is excluded.

**On the page itself:** your full name is the only `<h1>`, it's in every content image's alt text and file name, and the About section states "Also known as Flourish Okafor, and as Flourish1-bit on GitHub".

**Automatic audit:** `npm run build` ends with `scripts/check-seo.mjs`, which runs 53 checks and stops the build if anything important breaks. Run it alone with `npm run check:seo`.

Ranking also depends on steps only you can take. Do these after deploying:

1. **Google Search Console** (search.google.com/search-console). Add your site with the **URL prefix** option, choose **HTML tag**, and copy the `content="..."` code into `GOOGLE_SITE_VERIFICATION` on Vercel. Redeploy, then click Verify.
2. In Search Console, open **Sitemaps** and submit `sitemap.xml`. Then use **URL Inspection → Request indexing** on your home page.
3. **Bing Webmaster Tools** (bing.com/webmasters). You can import your site straight from Search Console, or paste its code into `BING_SITE_VERIFICATION`. Bing also powers DuckDuckGo and Yahoo results.
4. **Test it:** paste your URL into Google's Rich Results Test (search.google.com/test/rich-results) and validator.schema.org to see the structured data. Share the link in a WhatsApp chat to yourself to see the preview card.
5. **GitHub profile:** set your name to *Okafor Onyedikachukwu Flourish* and put the new site in the Website field. Add a profile README (a repo named `Flourish1-bit`) that links to it.
6. **Point your old portfolio here.** Google already knows `flourish-okafor-portfolio.vercel.app`. Add this `vercel.json` to that old project so its ranking passes to the new site:
   ```json
   { "redirects": [{ "source": "/(.*)", "destination": "https://okafor-onyedikachukwu-flourish.vercel.app/", "permanent": true }] }
   ```
   Do the same for `my-portfolio-1` and `flourish`, or at least link them to the new site.
7. Use the exact same name everywhere you publish: LinkedIn (once you're old enough), Dev.to, Behance or Dribbble for design, and each project's README.
8. A custom domain such as `onyedikachukwuflourish.com` helps further. Ask a parent or guardian to buy it, since registrars require an adult account holder.

New sites usually show up for a unique name within a few days to a few weeks after Search Console indexing.

## Check before you publish

- **FlorNeuroPulse:** the live link was cut off in the recording. Add it as `live:` in `src/data/profile.js`.
- **Mortgage calculator:** I read the address as `frontend-mentor-mortgage-calculator-lac.vercel.app`. Open it to confirm.
- **GitHub repos:** all "View code" links were checked on 3 November 2026 and point to public repos. If you make one private later, set its `repo:` to `null` in `src/data/profile.js`.

## Performance notes

- Fonts are self-hosted and subset (61 KB total). There's no Google Fonts request.
- The hero portrait loads eagerly with high priority, because it's the largest paint. Everything else uses `loading="lazy"`.
- The canvas starts when the browser is idle and caps pixel density. It uses a spatial grid and batched drawing, drops nodes automatically on slow devices, pauses in hidden tabs, and shows a still frame for people who prefer reduced motion.
- Live metrics only stream while that section is on screen.

## Safety

- The Gemini key stays on the server. The browser never sees it.
- Chat is rate limited per visitor (`CHAT_RATE_LIMIT`), and messages are length-checked.
- The site shows your town (Nsukka, Enugu State) but deliberately not your school. The assistant can say where you're based, but refuses to share your school, home address or phone number. If you ever add more personal details, check with a parent or guardian first.
