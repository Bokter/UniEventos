import React from "react";

/**
 * HeroOrbs — four ambient color blobs that float softly in the hero background.
 * Animation is entirely CSS-driven via the `.hero-orb` class + `--orb-duration`
 * custom property defined in redesign.css.
 *
 * HeroWave — a static SVG wave that transitions from the dark hero into the
 * light page content below.
 *
 * Together they form the "simple + complex" hero visualizer:
 *   Simple  → clean Lato body text and minimal layout
 *   Complex → layered orbs + moving dot grid + wave divider
 */

interface OrbConfig {
  size: number;
  color: string;
  style: React.CSSProperties;
  duration: string;
  delay?: string;
}

const ORBS: OrbConfig[] = [
  {
    // Warm coral — top right
    size: 400,
    color: "rgba(238,108,77,0.28)",
    style: { right: -90, top: -90 },
    duration: "9s",
  },
  {
    // Light blue — top center-right
    size: 280,
    color: "rgba(152,193,217,0.22)",
    style: { left: "38%", top: -55 },
    duration: "13s",
    delay: "-4s",
  },
  {
    // Navy — bottom left
    size: 260,
    color: "rgba(61,90,128,0.34)",
    style: { left: -65, bottom: 10 },
    duration: "11s",
    delay: "-7s",
  },
  {
    // Green mint — bottom right quadrant
    size: 175,
    color: "rgba(164,212,180,0.18)",
    style: { right: "18%", bottom: 30 },
    duration: "7.5s",
    delay: "-2s",
  },
];

export function HeroOrbs() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      {ORBS.map((orb, i) => (
        <div
          key={i}
          className="hero-orb"
          style={{
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle at 45% 45%, ${orb.color} 0%, transparent 68%)`,
            ...orb.style,
            ["--orb-duration" as string]: orb.duration,
            animationDelay: orb.delay ?? "0s",
          }}
        />
      ))}
    </div>
  );
}

/**
 * Scrolling dot-grid overlay — gives a subtle moving texture to the hero.
 * Defined via `.hero-dot-grid` + `@keyframes dotGridScroll` in redesign.css.
 */
export function HeroDotGrid() {
  return (
    <div
      className="hero-dot-grid"
      aria-hidden="true"
    />
  );
}

/**
 * Static SVG wave that visually separates the dark hero from the white content
 * section below it.
 */
export function HeroWave() {
  return (
    <div
      className="absolute bottom-0 left-0 w-full overflow-hidden leading-none pointer-events-none"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 52"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{ display: "block", width: "100%", height: "44px" }}
      >
        {/* Back wave — slightly muted */}
        <path
          d="M0,26 C360,52 1080,0 1440,26 L1440,52 L0,52 Z"
          fill="rgba(255,255,255,0.08)"
        />
        {/* Front wave — solid white, creates the page transition */}
        <path
          d="M0,36 C240,14 720,52 1440,28 L1440,52 L0,52 Z"
          fill="#ffffff"
        />
      </svg>
    </div>
  );
}
