import { useEffect, useRef, useState } from "react";

// Lazy image from an outside source (Unsplash). If it ever fails to load,
// a branded gradient tile takes its place so the layout never breaks.
export default function SmartImage({ src, srcSet, sizes, alt, width, height, className = "", fallbackLabel }) {
  const [failed, setFailed] = useState(false);
  const ref = useRef(null);

  // The prerendered <img> can fail before React attaches onError, so check
  // once on mount. currentSrc is empty while a lazy image is still waiting.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.currentSrc && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed) {
    return (
      <div className={`img-fallback ${className}`} role="img" aria-label={alt}>
        <span aria-hidden="true">{fallbackLabel}</span>
      </div>
    );
  }
  return (
    <img
      ref={ref}
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
