import React, { useState, useEffect } from 'react';

const Layout = ({ children }) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const updateMousePosition = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', updateMousePosition);

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
        };
    }, []);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
        document.body.style.overflow = !menuOpen ? 'hidden' : 'auto';
    };

    const handleLinkClick = () => {
        if (menuOpen) {
            setMenuOpen(false);
            document.body.style.overflow = 'auto';
        }
    };

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
                    zIndex: 0,
                    background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(29, 78, 216, 0.15), transparent 80%)`,
                }}
            />

            {/* Main Content */}
            <div style={{ position: 'relative', zIndex: 1, padding: '0 20px' }}>
                <header className={`header ${menuOpen ? 'menu-open' : ''}`}>
                    <div style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fz-xl)', fontWeight: 'bold' }}>mW</div>

                    {/* Desktop Nav */}
                    <nav className="nav">
                        <ol className="nav-list">
                            {['About', 'Projects', 'Contact'].map((item, i) => (
                                <li key={i} className="nav-item">
                                    <a href={`#${item.toLowerCase()}`} className="nav-link">
                                        <span className="nav-number">0{i + 1}.</span> {item}
                                    </a>
                                </li>
                            ))}
                        </ol>
                    </nav>

                    {/* Mobile Hamburger */}
                    <button className="hamburger" onClick={toggleMenu} aria-label="Menu">
                        <div className="hamburger-box">
                            <div className="hamburger-inner"></div>
                        </div>
                    </button>

                    {/* Mobile Sidebar Overlay */}
                    <aside className="mobile-nav-overlay">
                        <nav>
                            <ol className="mobile-nav-list" style={{ listStyle: 'none', padding: 0 }}>
                                {['About', 'Projects', 'Contact'].map((item, i) => (
                                    <li key={i} style={{ fontSize: 'var(--fz-lg)', fontFamily: 'var(--font-mono)' }}>
                                        <a
                                            href={`#${item.toLowerCase()}`}
                                            onClick={handleLinkClick}
                                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                                        >
                                            <span style={{ color: 'var(--green)', marginBottom: '5px' }}>0{i + 1}.</span>
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ol>
                        </nav>
                    </aside>
                </header>

                <main style={{
                    marginTop: '0px',
                    padding: '0 0 100px 0',
                    margin: '0 auto',
                    maxWidth: '1600px',
                    filter: menuOpen ? 'blur(5px)' : 'none',
                    transition: 'var(--transition)'
                }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
