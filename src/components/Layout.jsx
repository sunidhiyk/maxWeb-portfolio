import React, { useState, useEffect } from 'react';

const Layout = ({ children }) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const updateMousePosition = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', updateMousePosition);

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
        };
    }, []);

    return (
        <div style={{ position: 'relative', width: '100%', minHeight: '100vh' }}>
            {/* Background Spotlight */}
            <div
                style={{
                    pointerEvents: 'none',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 9999, // Should be on top? No, usually underneath or mixing-blend-mode.
                    // Brittany's is an illumination.
                    // Let's make it a background layer behind content but above the solid navy bg.
                    // Since body has navy bg, this div can just be transparent with the gradient.
                    background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(29, 78, 216, 0.15), transparent 80%)`,
                    zIndex: 0,
                }}
            />

            {/* Main Content */}
            <div style={{ position: 'relative', zIndex: 1, padding: '0 20px' }}>
                <header style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: 'var(--nav-height)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 50px',
                    backgroundColor: 'rgba(10, 25, 47, 0.85)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 10
                }}>
                    <div style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fz-xl)', fontWeight: 'bold' }}>mW</div>
                    <nav>
                        <ol style={{ display: 'flex', gap: '20px', listStyle: 'none' }}>
                            {['About', 'Projects', 'Contact'].map((item, i) => (
                                <li key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fz-xs)' }}>
                                    <a href={`#${item.toLowerCase()}`}>
                                        <span style={{ color: 'var(--green)' }}>0{i + 1}.</span> {item}
                                    </a>
                                </li>
                            ))}
                        </ol>
                    </nav>
                </header>

                <main style={{
                    marginTop: '0px',
                    padding: '0 0 100px 0',
                    margin: '0 auto',
                    maxWidth: '1600px'
                }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
