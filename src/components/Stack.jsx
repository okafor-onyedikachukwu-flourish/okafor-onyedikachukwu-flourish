import { stack } from "../data/profile.js";

export default function Stack() {
  return (
    <section className="section" id="stack" aria-labelledby="stack-title">
      <div className="wrap">
        <div className="section-head">
          <h2 id="stack-title">Tools I build with</h2>
          <p>One person, the whole product: interface, server, AI and brand.</p>
        </div>
        <div className="stack-groups">
          {stack.map((group) => (
            <div className="stack-group" key={group.group}>
              <h3>{group.group}</h3>
              <ul className="stack-list">
                {group.items.map((item) => (
                  <li className="stack-item" key={item.name}>
                    <img
                      src={item.icon}
                      alt=""
                      width="26"
                      height="26"
                      loading="lazy"
                      decoding="async"
                      className={item.invert ? "invert" : undefined}
                    />
                    <span>{item.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
