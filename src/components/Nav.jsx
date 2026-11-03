import { person } from "../data/profile.js";

const links = [
  ["#work", "Work"],
  ["#machine", "AI Machine"],
  ["#stack", "Stack"],
  ["#about", "About"]
];

export default function Nav() {
  return (
    <header className="site-header">
      <nav className="nav wrap" aria-label="Main">
        <a className="brand" href="#top" aria-label="Okafor Onyedikachukwu Flourish, back to top">
          <span className="brand-mark" aria-hidden="true">F</span>
          <span className="brand-name">Flourish Okafor</span>
        </a>
        <ul className="nav-links">
          {links.map(([href, label]) => (
            <li key={href}>
              <a href={href}>{label}</a>
            </li>
          ))}
        </ul>
        <a className="nav-cta" href={person.github} target="_blank" rel="me noopener">
          GitHub
        </a>
      </nav>
    </header>
  );
}
