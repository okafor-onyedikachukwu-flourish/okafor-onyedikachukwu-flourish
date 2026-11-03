export default function Sparkline({ values, label, max }) {
  const W = 200;
  const H = 46;
  if (values.length < 2) return <div className="spark spark--empty" aria-hidden="true" />;
  const top = max ?? Math.max(...values, 1) * 1.15;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * W, H - (Math.min(v, top) / top) * (H - 4) - 2]);
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <svg className="spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={label}>
      <polygon points={`0,${H} ${line} ${W},${H}`} fill="rgba(103,227,211,0.12)" />
      <polyline points={line} fill="none" stroke="var(--signal)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
