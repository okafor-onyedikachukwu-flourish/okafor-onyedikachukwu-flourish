import { person } from "../data/profile.js";

export default function Hero() {
  const portrait = person.portraits.hero;
  return (
    <section className="hero wrap" id="top" aria-labelledby="hero-title">
      <div className="hero-copy">
        <h1 id="hero-title" className="hero-name">
          <span>{person.familyName}</span> <span>{person.additionalName}</span> <span>{person.givenName}</span>
        </h1>
        <p className="hero-roles">{person.headline}</p>
        <p className="hero-intro">{person.intro}</p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="#work">
            See my work
          </a>
          <a className="btn btn-ghost" href="#machine">
            Ask my AI
          </a>
        </div>
      </div>

      <figure className="viewfinder">
        {/* The hero portrait is the largest thing on screen, so it loads eagerly
            with high priority; lazy-loading it would lower the PageSpeed score. */}
        <picture>
          <source
            type="image/webp"
            srcSet={`${portrait.base}-480.webp 480w, ${portrait.base}-840.webp 840w`}
            sizes="(max-width: 860px) 78vw, 400px"
          />
          <img
            src={`${portrait.base}.jpg`}
            alt={portrait.alt}
            width={portrait.width}
            height={portrait.height}
            fetchpriority="high"
            decoding="async"
          />
        </picture>
        <figcaption>{person.fullName}</figcaption>
      </figure>
    </section>
  );
}
