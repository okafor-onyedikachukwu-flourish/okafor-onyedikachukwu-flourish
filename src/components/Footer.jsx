import { person } from "../data/profile.js";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <p>
          © <span suppressHydrationWarning>{new Date().getFullYear()}</span> {person.fullName}. Designed and built by me.
        </p>
        <p>
          {person.links.map((l, i) => (
            <span key={l.href}>
              {i > 0 && ", "}
              <a href={l.href} target="_blank" rel="me noopener">
                {l.label}
              </a>
            </span>
          ))}
        </p>
      </div>
    </footer>
  );
}
