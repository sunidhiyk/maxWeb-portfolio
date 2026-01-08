import React from 'react';

const About = () => {
    return (
        <section id="about" className="section">
            <h2 className="section-heading" style={{ display: 'flex', alignItems: 'center', position: 'relative', margin: '10px 0 40px', width: '100%', fontSize: 'clamp(26px, 5vw, 32px)', whiteSpace: 'nowrap' }}>
                <span style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fz-md)', marginRight: '10px' }}>01.</span>
                About Us
                <span style={{ display: 'block', height: '1px', width: '300px', backgroundColor: 'var(--lightest-navy)', marginLeft: '20px' }}></span>
            </h2>

            <div style={{ maxWidth: '900px' }}>
                <div style={{ fontSize: 'var(--fz-lg)' }}>
                    <p>
                        Hello! We are maxWeb, a creative agency that loves dealing with sweet things on the internet. Our journey started when we decided to mix technology with creativity to produce seamless digital experiences.
                    </p>
                    <p>
                        Fast-forward to today, and we've had the privilege of working with meaningful clients. Our main focus these days is building accessible, inclusive products and digital experiences for a variety of clients.
                    </p>
                    <p>Here are a few technologies we've been working with recently:</p>
                    <ul style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 1fr) minmax(140px, 1fr)', padding: 0, margin: '20px 0 0 0', overflow: 'hidden', listStyle: 'none' }}>
                        {['JavaScript (ES6+)', 'React', 'Node.js', 'TypeScript', 'Antigravity', 'WordPress'].map((tech, i) => (
                            <li key={i} style={{ position: 'relative', marginBottom: '10px', paddingLeft: '20px', fontFamily: 'var(--font-mono)', fontSize: 'var(--fz-xs)' }}>
                                <span style={{ position: 'absolute', left: 0, color: 'var(--green)' }}>▹</span> {tech}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
};

export default About;
