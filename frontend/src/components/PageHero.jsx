import React from "react";

// Orange header band used at the top of every inner page so they all match the home page.
// `children` renders below the title (e.g. a search box or stat strip).
const PageHero = ({ badge, title, highlight, subtitle, actions, children, compact = false }) => (
  <section className={`y-hero ${compact ? "y-hero-compact" : ""}`}>
    <div className="container y-hero-inner">
      {badge && <span className="y-badge y-badge-light">{badge}</span>}
      <h1 className="y-hero-title">
        {title}
        {highlight && (
          <>
            {" "}
            <span style={{ color: "#ffedd5" }}>
              {highlight}
            </span>
          </>
        )}
      </h1>
      {subtitle && <p className="y-hero-subtitle">{subtitle}</p>}
      {actions && <div className="y-hero-actions">{actions}</div>}
      {children && <div className="y-hero-children">{children}</div>}
    </div>
  </section>
);

export default PageHero;
