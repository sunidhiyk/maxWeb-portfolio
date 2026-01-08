import React from 'react';

const Hero = () => {
  return (
    <section className="section">
      <h1 style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fz-md)', marginBottom: '20px' }}>
        Hi, we are
      </h1>
      <h2 style={{ fontSize: 'clamp(40px, 8vw, 80px)', color: 'var(--lightest-slate)', fontWeight: 600, margin: 0 }}>
        maxWeb.
      </h2>
      <h3 style={{ fontSize: 'clamp(40px, 8vw, 80px)', color: 'var(--slate)', fontWeight: 600, marginTop: '10px' }}>
        We build sweet digital experiences.
      </h3>
      <p style={{ maxWidth: '540px', marginTop: '20px', fontSize: 'var(--fz-lg)' }}>
        We are a software company specializing in building (and occasionally designing) exceptional digital experiences. Currently, we’re focused on building accessible, human-centered products.
      </p>
      <a
        href="#contact"
        style={{
          color: 'var(--green)',
          backgroundColor: 'transparent',
          border: '1px solid var(--green)',
          borderRadius: 'var(--border-radius)',
          padding: '1.25rem 1.75rem',
          fontSize: 'var(--fz-sm)',
          fontFamily: 'var(--font-mono)',
          lineHeight: '1',
          textDecoration: 'none',
          cursor: 'pointer',
          marginTop: '50px',
          display: 'inline-block'
        }}
      >
        Get In Touch
      </a>
    </section>
  );
};

export default Hero;
