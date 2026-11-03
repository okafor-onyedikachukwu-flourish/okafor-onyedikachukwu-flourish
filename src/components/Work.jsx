import { useState } from "react";
import { archive, categories, projects } from "../data/profile.js";
import SmartImage from "./SmartImage.jsx";

function ProjectImage({ project, featured }) {
  const sizes = featured ? "(max-width: 820px) 92vw, 540px" : "(max-width: 640px) 92vw, (max-width: 1100px) 46vw, 370px";
  if (project.image) {
    return (
      <img
        src={project.image.lg}
        srcSet={`${project.image.sm} 400w, ${project.image.lg} 720w`}
        sizes={sizes}
        alt={project.imageAlt}
        width="720"
        height="540"
        loading="lazy"
        decoding="async"
      />
    );
  }
  return (
    <SmartImage
      src={project.remoteImage}
      alt={project.imageAlt}
      width="720"
      height="540"
      sizes={sizes}
      fallbackLabel={project.name}
    />
  );
}

function ProjectCard({ project, featured = false }) {
  const titleId = `project-${project.slug}`;
  return (
    <article className={`project${featured ? " project--featured" : ""}`} aria-labelledby={titleId}>
      <div className="project-shot">
        <ProjectImage project={project} featured={featured} />
      </div>
      <div className="project-body">
        <h3 id={titleId}>{project.name}</h3>
        <p className="project-summary">{project.summary}</p>
        <p className="project-desc">{project.description}</p>
        <ul className="tags" aria-label="Built with">
          {project.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <div className="project-links">
          {project.live && (
            <a href={project.live} target="_blank" rel="noopener">
              Open live site<span className="visually-hidden"> for {project.name}</span>
            </a>
          )}
          {project.repo && (
            <a href={project.repo} target="_blank" rel="noopener">
              View code<span className="visually-hidden"> for {project.name}</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Work() {
  const [filter, setFilter] = useState("all");
  const visible = projects.filter((p) => filter === "all" || p.category === filter);
  const featured = visible.find((p) => p.featured);
  const rest = visible.filter((p) => p !== featured);
  const count = (id) => (id === "all" ? projects.length : projects.filter((p) => p.category === id).length);

  return (
    <section className="section" id="work" aria-labelledby="work-title">
      <div className="wrap">
        <div className="section-head">
          <h2 id="work-title">Selected work</h2>
          <p>Every project here is deployed and live. I designed and built each one, from the first sketch to production on Vercel.</p>
        </div>

        <div className="filters" role="group" aria-label="Filter projects">
          {categories.map((c) => (
            <button key={c.id} type="button" className="chip" aria-pressed={filter === c.id} onClick={() => setFilter(c.id)}>
              {c.label}
              <span className="chip-count">{count(c.id)}</span>
            </button>
          ))}
        </div>

        {featured && <ProjectCard project={featured} featured />}
        <ul className="project-grid">
          {rest.map((p) => (
            <li key={p.slug}>
              <ProjectCard project={p} />
            </li>
          ))}
        </ul>

        <div className="archive">
          <h3>Earlier sites</h3>
          <ul>
            {archive.map((a) => (
              <li key={a.href}>
                <a href={a.href} target="_blank" rel="noopener">
                  {a.name}
                </a>{" "}
                <span>{a.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
