import { useEffect, useRef } from "react";

// ─── Shimmer keyframe injection ───────────────────────────────────────────────
const SHIMMER_CSS = `
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  @keyframes skeleton-fade {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.45; }
  }
  .skeleton-shimmer {
    background: linear-gradient(
      90deg,
      #111827 0%,
      #1a2235 40%,
      #1f2a40 50%,
      #1a2235 60%,
      #111827 100%
    );
    background-size: 600px 100%;
    animation: shimmer 1.8s ease-in-out infinite;
    border-radius: 6px;
  }
  .skeleton-pulse {
    background: #111827;
    animation: skeleton-fade 1.8s ease-in-out infinite;
    border-radius: 6px;
  }
`;

function useStyleInjection() {
  const injected = useRef(false);
  useEffect(() => {
    if (injected.current) return;
    injected.current = true;
    const el = document.createElement("style");
    el.textContent = SHIMMER_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);
}

// ─── SkeletonBase ─────────────────────────────────────────────────────────────
const SkeletonBase = ({
  className = "",
  style = {},
  animate = true,
  shimmer = true,
}) => {
  useStyleInjection();
  const effect = !animate
    ? ""
    : shimmer
      ? "skeleton-shimmer"
      : "skeleton-pulse";
  return (
    <div
      className={`${effect} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

// ─── SkeletonCard ─────────────────────────────────────────────────────────────
export const SkeletonCard = () => (
  <div
    style={{
      background: "linear-gradient(135deg, #0f1318 0%, #141920 100%)",
      border: "1px solid #1e2535",
      boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
      borderRadius: "12px",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    }}
  >
    <SkeletonBase style={{ height: "12px", width: "80px" }} />
    <SkeletonBase style={{ height: "36px", width: "112px" }} />
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        paddingTop: "4px",
      }}
    >
      <SkeletonBase
        style={{ height: "12px", width: "12px", borderRadius: "50%" }}
      />
      <SkeletonBase style={{ height: "12px", width: "144px" }} />
    </div>
  </div>
);

// ─── SkeletonStats ────────────────────────────────────────────────────────────
export const SkeletonStats = () => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "20px",
      marginBottom: "24px",
    }}
  >
    {[0, 1, 2].map((i) => (
      <div key={i} style={{ animationDelay: `${i * 120}ms` }}>
        <SkeletonCard />
      </div>
    ))}
  </div>
);

// ─── SkeletonTableRow ─────────────────────────────────────────────────────────
export const SkeletonTableRow = ({ index = 0 }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(12, 1fr)",
      gap: "16px",
      padding: "18px 24px",
      borderBottom: "1px solid #1a2030",
      alignItems: "center",
    }}
  >
    {/* checkbox */}
    <div style={{ gridColumn: "span 1" }}>
      <SkeletonBase
        style={{ height: "16px", width: "16px", borderRadius: "4px" }}
      />
    </div>
    {/* status dot */}
    <div style={{ gridColumn: "span 1" }}>
      <SkeletonBase
        style={{ height: "12px", width: "12px", borderRadius: "50%" }}
      />
    </div>
    {/* badge */}
    <div style={{ gridColumn: "span 1" }}>
      <SkeletonBase
        style={{ height: "20px", width: "56px", borderRadius: "999px" }}
      />
    </div>
    {/* main label */}
    <div style={{ gridColumn: "span 5" }}>
      <SkeletonBase style={{ height: "14px", width: "176px" }} />
    </div>
    {/* meta */}
    <div style={{ gridColumn: "span 1" }}>
      <SkeletonBase style={{ height: "14px", width: "40px" }} />
    </div>
    {/* actions */}
    <div
      style={{
        gridColumn: "span 3",
        display: "flex",
        justifyContent: "flex-end",
        gap: "8px",
      }}
    >
      <SkeletonBase
        style={{ height: "32px", width: "96px", borderRadius: "8px" }}
      />
      <SkeletonBase
        style={{ height: "32px", width: "64px", borderRadius: "8px" }}
      />
    </div>
  </div>
);

// ─── SkeletonTable ────────────────────────────────────────────────────────────
export const SkeletonTable = ({ rows = 5 }) => (
  <div
    style={{
      background: "#0c1017",
      border: "1px solid #1a2030",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    }}
  >
    {/* header */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "16px 24px",
        background: "linear-gradient(90deg, #111620 0%, #141b28 100%)",
        borderBottom: "1px solid #1a2030",
      }}
    >
      <SkeletonBase
        style={{
          height: "12px",
          width: "12px",
          borderRadius: "50%",
          flexShrink: 0,
        }}
      />
      <SkeletonBase style={{ height: "12px", width: "160px" }} />
      <div style={{ marginLeft: "auto" }}>
        <SkeletonBase
          style={{ height: "28px", width: "112px", borderRadius: "8px" }}
        />
      </div>
    </div>

    {/* rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonTableRow key={i} index={i} />
    ))}

    {/* footer */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 24px",
        borderTop: "1px solid #1a2030",
        background: "#0c1017",
      }}
    >
      <SkeletonBase style={{ height: "12px", width: "96px" }} />
      <div style={{ display: "flex", gap: "8px" }}>
        {[0, 1, 2].map((i) => (
          <SkeletonBase
            key={i}
            style={{ height: "28px", width: "28px", borderRadius: "6px" }}
          />
        ))}
      </div>
    </div>
  </div>
);

// ─── SkeletonDetail ───────────────────────────────────────────────────────────
export const SkeletonDetail = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
    {/* breadcrumb row */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <SkeletonBase
          style={{ height: "32px", width: "32px", borderRadius: "8px" }}
        />
        <SkeletonBase style={{ height: "16px", width: "128px" }} />
      </div>
      <SkeletonBase
        style={{ height: "20px", width: "192px", borderRadius: "999px" }}
      />
    </div>

    {/* main info card */}
    <div
      style={{
        background: "#0c1017",
        border: "1px solid #1a2030",
        borderRadius: "12px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <SkeletonBase
          style={{
            height: "40px",
            width: "40px",
            flexShrink: 0,
            borderRadius: "10px",
          }}
        />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <SkeletonBase style={{ height: "20px", width: "224px" }} />
          <SkeletonBase style={{ height: "12px", width: "320px" }} />
        </div>
        <SkeletonBase
          style={{ height: "32px", width: "96px", borderRadius: "8px" }}
        />
      </div>

      {/* divider */}
      <div style={{ height: "1px", background: "#1a2030" }} />

      {/* text lines */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {[1, 0.9, 0.95, 0.7].map((w, i) => (
          <SkeletonBase
            key={i}
            style={{ height: "12px", width: `${w * 100}%` }}
          />
        ))}
      </div>

      {/* content block */}
      <SkeletonBase
        style={{ height: "112px", width: "100%", borderRadius: "10px" }}
      />
    </div>

    {/* two-column section */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "20px",
      }}
    >
      <SkeletonBase
        style={{ height: "260px", width: "100%", borderRadius: "12px" }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <SkeletonBase
          style={{ height: "120px", width: "100%", borderRadius: "12px" }}
        />
        <SkeletonBase
          style={{ height: "128px", width: "100%", borderRadius: "12px" }}
        />
      </div>
    </div>
  </div>
);

// ─── Preview (default export) ─────────────────────────────────────────────────
export default SkeletonBase;
