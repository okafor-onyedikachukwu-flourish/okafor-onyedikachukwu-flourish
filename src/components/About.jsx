import { person } from "../data/profile.js";

export default function About() {
  const portrait = person.portraits.about;
  return (
    <section className="section" id="about" aria-labelledby="about-title">
      <div className="wrap about">
        <div className="about-photo">
          <picture>
            <source
              type="image/webp"
              srcSet={`${portrait.base}-480.webp 480w, ${portrait.base}-840.webp 840w`}
              sizes="(max-width: 820px) 80vw, 400px"
            />
            <img
              src={`${portrait.base}.jpg`}
              alt={portrait.alt}
              width={portrait.width}
              height={portrait.height}
              loading="lazy"
              decoding="async"
            />
          </picture>
        </div>
        <div className="about-text">
          <h2 id="about-title">About Flourish</h2>
          <p className="aka">{person.aka}</p>
          {person.bio.map((para) => (
            <p key={para.slice(0, 24)}>{para}</p>
          ))}
          <div className="about-links">
            <a className="btn btn-primary" href={person.github} target="_blank" rel="me noopener">
              Follow me on GitHub
            </a>
            <a className="btn btn-ghost" href="#machine">
              Ask my AI a question
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
