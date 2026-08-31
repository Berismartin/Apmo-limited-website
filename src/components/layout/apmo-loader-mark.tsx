import type { CSSProperties } from "react"

export function ApmoLoaderMark() {
  return (
    <div
      className="apmo-loader"
      role="status"
      aria-live="polite"
      aria-label="Loading Apmo"
    >
      <div className="apmo-loader__wash" aria-hidden="true" />
      <div className="apmo-loader__glow apmo-loader__glow--rose" aria-hidden="true" />
      <div className="apmo-loader__glow apmo-loader__glow--amber" aria-hidden="true" />
      <div className="apmo-loader__glow apmo-loader__glow--leaf" aria-hidden="true" />

      <div className="apmo-loader__petals" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => (
          <span
            key={i}
            className="apmo-loader__petal"
            style={{ "--i": String(i) } as CSSProperties}
          />
        ))}
      </div>

      <div className="apmo-loader__stage">
        <div className="apmo-loader__orbit">
          <span className="apmo-loader__ring apmo-loader__ring--outer" aria-hidden="true" />
          <span className="apmo-loader__ring apmo-loader__ring--inner" aria-hidden="true" />
          <span className="apmo-loader__sparkle apmo-loader__sparkle--a" aria-hidden="true" />
          <span className="apmo-loader__sparkle apmo-loader__sparkle--b" aria-hidden="true" />
          <span className="apmo-loader__sparkle apmo-loader__sparkle--c" aria-hidden="true" />
          <span className="apmo-loader__leaf apmo-loader__leaf--left" aria-hidden="true" />
          <span className="apmo-loader__leaf apmo-loader__leaf--right" aria-hidden="true" />
          <img
            src="/images/site_images/logo.png"
            alt="Apmo"
            className="apmo-loader__logo"
            width={220}
            height={88}
          />
        </div>

        <p className="apmo-loader__tag">Curls · Care · Confidence</p>
      </div>

      <div className="apmo-loader__bar" aria-hidden="true">
        <span />
      </div>
    </div>
  )
}
