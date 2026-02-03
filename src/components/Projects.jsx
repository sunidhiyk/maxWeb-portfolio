import React, { useRef, useState, useEffect } from 'react';

const Projects = () => {
    const scrollContainerRef = useRef(null);
    // Pause state to stop auto-scroll when user interacts
    const [isPaused, setIsPaused] = useState(false);

    const projects = [
        {
            title: 'N.E.R.D.S. Website',
            description: 'The official website for the Robotics Club of NIT Silchar. A dynamic platform built to showcase club activities, events, and the team. It features a modern design and smooth performance.',
            tech: ['React', 'Tailwind CSS', 'Vite'],
            link: 'https://www.nerdsnitsilchar.in/',
            image: '/assets/nerds.png'
        },
        {
            title: 'BaruahEPC',
            description: 'A professional corporate website for an EPC (Engineering, Procurement, and Construction) company. It showcases large-scale infrastructure projects, services, and company capabilities with a clean, industrial aesthetic.',
            tech: ['React', 'Tailwind CSS', 'Vercel'],
            link: 'https://www.baruahgroup.com/',
            image: '/assets/baruah-epc.png'
        },
        {
            title: 'Technical Fest Tecnoesis Page',
            description: 'We developed the Robotron page for the Tecnoesis website, the annual technical festival. This section highlights the robotics competition details with a futuristic, cyber-themed design.',
            tech: ['React', 'Animation', 'UI/UX'],
            link: 'https://tecnoesis.co.in',
            image: '/assets/robotron.png'
        },
        {
            title: 'Fitness Tracker Website',
            description: 'A comprehensive health dashboard named FitTrack. It enables users to log meals and workouts, view daily progress, and track macros like calories, protein, carbs, and fats in real-time.',
            tech: ['React', 'Dashboard', 'Data Viz'],
            link: null,
            image: '/assets/fit-tracker.png'
        },

    ];

    // Auto-scroll logic
    useEffect(() => {
        const interval = setInterval(() => {
            // Check for mobile view to prevent auto-scrolling
            if (window.innerWidth <= 768) return;

            if (!isPaused && scrollContainerRef.current) {
                const container = scrollContainerRef.current;
                const cardWidth = container.querySelector('.project-container')?.offsetWidth || 0;
                const gap = 20; // from CSS
                const scrollAmount = cardWidth + gap;

                // If we are near the end, scroll back to start
                if (container.scrollLeft + container.offsetWidth >= container.scrollWidth - 10) {
                    container.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                }
            }
        }, 3500); // 3.5 seconds

        return () => clearInterval(interval);
    }, [isPaused]);

    const scrollNext = () => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const cardWidth = container.querySelector('.project-container')?.offsetWidth || 0;
            container.scrollBy({ left: cardWidth + 20, behavior: 'smooth' });
        }
    };

    const scrollPrev = () => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const cardWidth = container.querySelector('.project-container')?.offsetWidth || 0;
            container.scrollBy({ left: -(cardWidth + 20), behavior: 'smooth' });
        }
    };

    return (
        <section id="projects" className="section">
            <h2 className="section-heading">
                <span className="section-number">02.</span>
                Some Things We've Built
                <span className="section-line"></span>
            </h2>

            {/* Container wrapper for relative positioning of arrows */}
            <div style={{ position: 'relative' }}>
                <div
                    className="projects-grid"
                    ref={scrollContainerRef}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)} // Pause on touch
                    onTouchEnd={() => {
                        // Optional: Resume after a delay, or just let it stay paused until next view
                        setTimeout(() => setIsPaused(false), 5000);
                    }}
                >
                    {projects.map((project, i) => (
                        <div key={i} className="project-container">
                            <div className={`project-image-wrapper ${i % 2 !== 0 ? 'alternate' : ''}`}>
                                <a href={project.link} target="_blank" rel="noopener noreferrer">
                                    {project.image ? (
                                        <img
                                            src={project.image}
                                            alt={project.title}
                                            className="project-img"
                                        />
                                    ) : ( // simplified placeholder logic
                                        <div style={{
                                            height: '100%',
                                            width: '100%',
                                            backgroundColor: 'var(--light-navy)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: 'var(--border-radius)'
                                        }}>
                                            <span style={{ color: 'var(--light-slate)' }}>Placeholder</span>
                                        </div>
                                    )}
                                </a>
                            </div>

                            <div className={`project-content ${i % 2 !== 0 ? 'alternate' : ''}`}>
                                <div>
                                    <p className="project-overline">Featured Project</p>
                                    <h3 className="project-title">
                                        <a href={project.link} target="_blank" rel="noopener noreferrer">{project.title}</a>
                                    </h3>
                                    <div className="project-description">
                                        <p>{project.description}</p>
                                    </div>
                                    <ul className="project-tech-list">
                                        {project.tech.map((t, idx) => <li key={idx}>{t}</li>)}
                                    </ul>
                                    <div className="project-links">
                                        {project.link && (
                                            <a href={project.link} target="_blank" rel="noopener noreferrer" aria-label="External Link">
                                                <span style={{ color: 'var(--green)' }}>External Link ↗</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile Arrows */}
                {/* Mobile Arrows */}
                <button className="slider-arrow prev" onClick={scrollPrev} aria-label="Previous Project">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <button className="slider-arrow next" onClick={scrollNext} aria-label="Next Project">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                </button>
            </div>
        </section>
    );
};

export default Projects;
