// ---------------------------------------------------------------------------
// Single source of truth for the portfolio of Okafor Onyedikachukwu Flourish.
// The React frontend, the Node backend (AI chat knowledge base) and the SEO
// prerender script all import this file, so edit facts here and only here.
// Plain JavaScript only (no JSX): Node imports it directly.
// ---------------------------------------------------------------------------

const viteSiteUrl = import.meta.env?.VITE_SITE_URL;
const nodeSiteUrl = typeof process !== "undefined" ? process.env?.SITE_URL : undefined;

// Your public address. Set SITE_URL (server/build) or VITE_SITE_URL in .env.
// Best: a custom domain such as https://onyedikachukwuflourish.com
export const SITE_URL = (viteSiteUrl || nodeSiteUrl || "https://okafor-onyedikachukwu-flourish.vercel.app").replace(/\/$/, "");

export const person = {
  fullName: "Okafor Onyedikachukwu Flourish",
  givenName: "Flourish",
  additionalName: "Onyedikachukwu",
  familyName: "Okafor",
  // Every spelling people (and Google) might use for you.
  alternateNames: ["Flourish Okafor", "Onyedikachukwu Flourish Okafor", "Flourish Onyedikachukwu Okafor"],
  age: 14,
  // Town-level only. The school is deliberately not published.
  location: {
    locality: "Nsukka",
    region: "Enugu State",
    country: "Nigeria",
    countryCode: "NG",
    text: "Nsukka, Enugu State, Nigeria",
    wikipedia: "https://en.wikipedia.org/wiki/Nsukka"
  },
  roles: ["Full-stack developer", "Graphic designer", "AI developer"],
  headline: "Full-stack developer, graphic designer and AI developer",
  intro:
    "I’m 14, based in Nsukka, Enugu State, Nigeria, and I build real products end to end: React and Next.js interfaces, Node back ends, AI agents powered by large language models, and the visual identity that ties them together.",
  bio: [
    "I’m Okafor Onyedikachukwu Flourish, a 14-year-old full-stack developer, graphic designer and AI developer based in Nsukka, Enugu State, Nigeria. I design the brand, build the interface and wire up the back end myself, then ship it to production on Vercel.",
    "My recent work is mostly AI: FlorScene.Agent turns one prompt into a multi-track film sequence using a crew of AI agents, and OmniDesk Local uses Gemini AI to triage customer messages for small service businesses.",
    "I also build practical tools: EcoSmart for smarter waste management, a SaaS workspace for trade crews, and a smart motorcycle parking sign-in. Every project here is live, so you can open it and try it."
  ],
  github: "https://github.com/okafor-onyedikachukwu-flourish",
  links: [
    { label: "GitHub", href: "https://github.com/okafor-onyedikachukwu-flourish" },
    { label: "Previous portfolio", href: "https://flourish-okafor-portfolio.vercel.app" }
  ],
  // Linked to Wikipedia so search engines know exactly which topic is meant.
  knowsAbout: [
    { name: "Full-stack web development", sameAs: "https://en.wikipedia.org/wiki/Web_development" },
    { name: "React", sameAs: "https://en.wikipedia.org/wiki/React_(software)" },
    { name: "Next.js", sameAs: "https://en.wikipedia.org/wiki/Next.js" },
    { name: "Node.js", sameAs: "https://en.wikipedia.org/wiki/Node.js" },
    { name: "JavaScript", sameAs: "https://en.wikipedia.org/wiki/JavaScript" },
    { name: "Artificial intelligence", sameAs: "https://en.wikipedia.org/wiki/Artificial_intelligence" },
    { name: "AI agents", sameAs: "https://en.wikipedia.org/wiki/Intelligent_agent" },
    { name: "Large language models", sameAs: "https://en.wikipedia.org/wiki/Large_language_model" },
    { name: "Google Gemini", sameAs: "https://en.wikipedia.org/wiki/Gemini_(language_model)" },
    { name: "Graphic design", sameAs: "https://en.wikipedia.org/wiki/Graphic_design" },
    { name: "User interface design", sameAs: "https://en.wikipedia.org/wiki/User_interface_design" },
    { name: "Brand identity" }
  ],
  // Standard O*NET-SOC occupation codes help search engines classify each role.
  occupations: [
    { name: "Full-stack developer", code: "15-1254.00", codeName: "Web Developers", skills: ["React", "Next.js", "Node.js", "Express", "JavaScript", "Vite"] },
    { name: "AI developer", code: "15-1252.00", codeName: "Software Developers", skills: ["AI agents", "LLM orchestration", "Gemini API"] },
    { name: "Graphic designer", code: "27-1024.00", codeName: "Graphic Designers", skills: ["Brand identity", "UI design", "Figma", "Photoshop", "Illustrator", "Canva"] }
  ],
  aka: "Also known as Flourish Okafor, and as okafor-onyedikachukwu-flourish on GitHub.",
  portraits: {
    hero: {
      base: "/assets/images/okafor-onyedikachukwu-flourish-portrait-grey-suit",
      alt: "Okafor Onyedikachukwu Flourish, full-stack developer, graphic designer and AI developer, portrait in a grey suit and black tie",
      width: 830,
      height: 1022
    },
    about: {
      base: "/assets/images/okafor-onyedikachukwu-flourish-portrait-black-turtleneck",
      alt: "Okafor Onyedikachukwu Flourish, AI developer and graphic designer, portrait in a black turtleneck and blazer",
      width: 830,
      height: 1022
    }
  },
  ogImage: "/assets/images/okafor-onyedikachukwu-flourish-share-card.jpg"
};

// ---------------------------------------------------------------------------
// Search and social metadata. scripts/prerender.mjs turns this into the page
// <head>, structured data, sitemap, robots.txt, humans.txt and llms.txt, and
// scripts/check-seo.mjs fails the build if any of it goes missing.
// ---------------------------------------------------------------------------
export const seo = {
  // Shown as the blue link in Google. Under 60 characters so it never cuts off.
  title: "Okafor Onyedikachukwu Flourish | Full-Stack & AI Developer",
  // The grey text under the link. Keep it 120 to 160 characters.
  description:
    "Okafor Onyedikachukwu Flourish (Flourish Okafor) is a 14-year-old full-stack developer, graphic designer and AI developer in Nsukka, Enugu State, Nigeria.",
  // Used by WhatsApp, LinkedIn, X, Facebook and Discord link previews.
  socialTitle: "Okafor Onyedikachukwu Flourish: Full-Stack Developer, Graphic Designer and AI Developer",
  socialDescription:
    "Live AI agents, full-stack apps and brand design by Okafor Onyedikachukwu Flourish (Flourish Okafor), a 14-year-old developer in Nsukka, Enugu State, Nigeria.",
  socialImageAlt: "Okafor Onyedikachukwu Flourish, full-stack developer, graphic designer and AI developer",
  // Google ignores this tag, but Bing and some smaller engines still read it.
  keywords: [
    "Okafor Onyedikachukwu Flourish", "Flourish Okafor", "Onyedikachukwu Flourish Okafor", "Flourish Onyedikachukwu Okafor",
    "full-stack developer", "AI developer", "graphic designer", "React developer", "young developer",
    "FlorScene.Agent", "OmniDesk Local", "FlorXup", "SiteQuote AI", "EcoSmart",
    "developer in Nsukka", "Enugu State developer", "Nigerian developer", "Nigerian AI developer"
  ],
  // The day this portfolio first went live. Keep it fixed; dateModified updates on every build.
  datePublished: "2026-11-03"
};

// Project screenshots were captured from Flourish's own screen recording of
// his Vercel dashboard and live sites. Paths follow assets/images/projects/.
const shot = (slug) => ({
  sm: `/assets/images/projects/okafor-onyedikachukwu-flourish-${slug}-sm.webp`,
  lg: `/assets/images/projects/okafor-onyedikachukwu-flourish-${slug}-lg.webp`
});

const unsplash = (id, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;

export const categories = [
  { id: "all", label: "All work" },
  { id: "ai", label: "AI products" },
  { id: "fullstack", label: "Full-stack apps" },
  { id: "design", label: "Design and games" }
];

export const projects = [
  {
    slug: "florscene-agent",
    name: "FlorScene.Agent",
    category: "ai",
    featured: true,
    year: 2025,
    summary: "Turns a single prompt into a multi-track cinema sequence.",
    description:
      "An autonomous agentic filmmaking studio. AI screenwriter, cinematographer and lighting-director agents work together to produce editable timelines, screenplay scripts and DaVinci Resolve–ready EDL cuts from one idea.",
    tags: ["AI agents", "LLM orchestration", "React", "Vite"],
    live: "https://flor-scene-agent.vercel.app",
    repo: "https://github.com/okafor-onyedikachukwu-flourish/FlorScene-Agent",
    image: shot("florscene-agent"),
    imageAlt: "Okafor Onyedikachukwu Flourish – FlorScene.Agent AI filmmaking app home screen: turn a single prompt into a multi-track cinema sequence"
  },
  {
    slug: "omnidesk-local",
    name: "OmniDesk Local",
    category: "ai",
    year: 2025,
    summary: "AI triage agent for local service teams.",
    description:
      "Turns incoming customer inquiry threads into revenue by detecting intent, predicting urgency and drafting conversion-ready replies with Gemini AI. Includes a live chat widget demo and dashboard.",
    tags: ["Gemini AI", "Next.js", "Framer Motion"],
    live: "https://omini-desk-local.vercel.app",
    repo: "https://github.com/okafor-onyedikachukwu-flourish/OminiDesk-Local",
    image: shot("omnidesk-local"),
    imageAlt: "Okafor Onyedikachukwu Flourish – OmniDesk Local Gemini AI customer triage agent landing page"
  },
  {
    slug: "florneuropulse",
    name: "FlorNeuroPulse",
    category: "ai",
    year: 2025,
    summary: "My newest AI build, the FlorNeuroPulse core.",
    description:
      "The core engine of FlorNeuroPulse, my latest AI project. Shipped October 2025 and still growing.",
    tags: ["AI", "In progress"],
    live: null, // Add the live URL from your Vercel dashboard (it was cut off in the recording).
    repo: "https://github.com/okafor-onyedikachukwu-flourish/FlorNeuroPulse",
    remoteImage: unsplash("photo-1677442136019-21780ecad995"),
    imageAlt: "Okafor Onyedikachukwu Flourish – FlorNeuroPulse AI project, abstract neural network visual"
  },
  {
    slug: "florxup",
    name: "FlorXup",
    category: "fullstack",
    year: 2025,
    summary: "A messaging app built around private conversations.",
    description:
      "A chat platform designed so people can connect freely while keeping their conversations private.",
    tags: ["Real-time chat", "React", "Vite"],
    live: "https://florxup.vercel.app",
    repo: "https://github.com/okafor-onyedikachukwu-flourish/FlorXup",
    image: shot("florxup"),
    imageAlt: "Okafor Onyedikachukwu Flourish – FlorXup private chat web app landing page"
  },
  {
    slug: "sitequote-ai",
    name: "SiteQuote AI",
    category: "fullstack",
    year: 2025,
    summary: "SaaS workspace for trade contractors and their field crews.",
    description:
      "Field workers clock in to shifts, log job-site progress, see assigned schedules and request materials from their contractor, all from a phone-first workspace.",
    tags: ["SaaS", "React", "Vite"],
    live: "https://site-quote-ai.vercel.app",
    repo: "https://github.com/okafor-onyedikachukwu-flourish/SiteQuote-AI",
    image: shot("sitequote-ai"),
    imageAlt: "Okafor Onyedikachukwu Flourish – SiteQuote AI SaaS field worker dashboard with shift timer"
  },
  {
    slug: "ecosmart",
    name: "EcoSmart",
    category: "fullstack",
    year: 2025,
    summary: "Manage, recycle and reduce waste smarter.",
    description:
      "A waste-management web app with a waste categorizer, a map of nearby recycling centres and a form to report waste issues with photos. Designed and branded by me.",
    tags: ["Web app", "Maps", "Brand design"],
    live: "https://ecosmart-website.vercel.app",
    repo: "https://github.com/okafor-onyedikachukwu-flourish/Ecosmart-website",
    image: shot("ecosmart"),
    imageAlt: "Okafor Onyedikachukwu Flourish – EcoSmart waste management web app splash screen, designed by Flourish Okafor"
  },
  {
    slug: "unn-smart-parking",
    name: "UNN Smart Motorcycle Parking",
    category: "fullstack",
    year: 2025,
    summary: "Rider sign-in for a smart motorcycle parking system.",
    description:
      "A production-ready authentication interface where riders sign in with a registration number or staff ID, keeping rider identity separate from the parking service layer.",
    tags: ["Authentication", "React", "Vite"],
    live: "https://unn-parking-lot.vercel.app",
    repo: "https://github.com/okafor-onyedikachukwu-flourish/unnParkingLot",
    image: shot("unn-smart-parking"),
    imageAlt: "Okafor Onyedikachukwu Flourish – UNN smart motorcycle parking rider sign-in screen"
  },
  {
    slug: "tic-tac-toe-deluxe",
    name: "Tic Tac Toe Deluxe",
    category: "design",
    year: 2025,
    summary: "A neon take on the classic game.",
    description:
      "Tic-tac-toe with selectable difficulty, background music, a restart control and a glowing neon board.",
    tags: ["Game", "JavaScript", "Visual design"],
    live: "https://tic-tac-toe-navy-kappa.vercel.app",
    repo: "https://github.com/okafor-onyedikachukwu-flourish/Tic-Tac-Toe",
    image: shot("tic-tac-toe-deluxe"),
    imageAlt: "Okafor Onyedikachukwu Flourish – Tic Tac Toe Deluxe neon game board with difficulty and music controls"
  },
  {
    slug: "mortgage-calculator",
    name: "Mortgage Repayment Calculator",
    category: "design",
    year: 2025,
    summary: "Frontend Mentor challenge, built pixel-close to the design.",
    description:
      "A responsive mortgage calculator for repayment and interest-only loans, with a dedicated results panel.",
    tags: ["Frontend Mentor", "Responsive UI", "Forms"],
    live: "https://frontend-mentor-mortgage-calculator-lac.vercel.app",
    repo: "https://github.com/okafor-onyedikachukwu-flourish/frontendMentor-MortgageCalculator",
    image: shot("mortgage-calculator"),
    imageAlt: "Okafor Onyedikachukwu Flourish – Frontend Mentor mortgage repayment calculator interface"
  }
];

export const archive = [
  { name: "Portfolio v2", href: "https://flourish-okafor-portfolio.vercel.app", note: "Purple edition, August 2025" },
  { name: "Portfolio v1", href: "https://my-portfolio-1-mu-two.vercel.app", note: "My first portfolio" },
  { name: "Flourish", href: "https://flourish-navy.vercel.app", note: "Early experiment, July 2025" }
];

// Devicon logos, verified against devicon@2.16.0 on the npm registry.
const devicon = (path) => `https://cdn.jsdelivr.net/npm/devicon@2.16.0/icons/${path}.svg`;

export const stack = [
  {
    group: "Build the interface",
    items: [
      { name: "React", icon: devicon("react/react-original") },
      { name: "Next.js", icon: devicon("nextjs/nextjs-original"), invert: true },
      { name: "Vite", icon: devicon("vitejs/vitejs-original") },
      { name: "JavaScript", icon: devicon("javascript/javascript-original") },
      { name: "HTML5", icon: devicon("html5/html5-original") },
      { name: "CSS3", icon: devicon("css3/css3-original") },
      { name: "Framer Motion", icon: devicon("framermotion/framermotion-original"), invert: true }
    ]
  },
  {
    group: "Run the back end and AI",
    items: [
      { name: "Node.js", icon: devicon("nodejs/nodejs-original") },
      { name: "Express", icon: devicon("express/express-original"), invert: true },
      { name: "Gemini API", icon: devicon("google/google-original") },
      { name: "Git", icon: devicon("git/git-original") },
      { name: "GitHub", icon: devicon("github/github-original"), invert: true },
      { name: "Vercel", icon: devicon("vercel/vercel-original"), invert: true }
    ]
  },
  {
    group: "Design the brand",
    items: [
      { name: "Figma", icon: devicon("figma/figma-original") },
      { name: "Photoshop", icon: devicon("photoshop/photoshop-original") },
      { name: "Illustrator", icon: devicon("illustrator/illustrator-plain") },
      { name: "Canva", icon: devicon("canva/canva-original") }
    ]
  }
];

// Supplemental visuals for the AI Machine section (Unsplash, hotlinked as
// Unsplash requires). SmartImage falls back to a gradient if one fails.
export const machineVisuals = [
  {
    src: unsplash("photo-1558494949-ef010cbdcc31", 720),
    alt: "Server racks representing the Node.js back end of Okafor Onyedikachukwu Flourish’s AI machine",
    caption: "Orchestration server"
  },
  {
    src: unsplash("photo-1518770660439-4636190af475", 720),
    alt: "Circuit board close-up representing the inference layer of Okafor Onyedikachukwu Flourish’s AI machine",
    caption: "Inference layer"
  },
  {
    src: unsplash("photo-1451187580459-43490279c0fa", 720),
    alt: "Global network visual representing streaming delivery in Okafor Onyedikachukwu Flourish’s AI machine",
    caption: "Streaming edge"
  }
];

export const suggestedQuestions = [
  "What has Flourish built with AI?",
  "Which tech stack does he use?",
  "Tell me about FlorScene.Agent",
  "Does he do graphic design?"
];
