import React from 'react';

const Projects = () => {
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
            link: 'https://baruah-epc.vercel.app/',
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

    return (
        <section id="projects" className="section">
            <h2 className="section-heading" style={{ display: 'flex', alignItems: 'center', position: 'relative', margin: '10px 0 40px', width: '100%', fontSize: 'clamp(26px, 5vw, 32px)', whiteSpace: 'nowrap' }}>
                <span style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fz-md)', marginRight: '10px' }}>02.</span>
                Some Things We've Built
                <span style={{ display: 'block', height: '1px', width: '300px', backgroundColor: 'var(--lightest-navy)', marginLeft: '20px' }}></span>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '100px' }}>
                {projects.map((project, i) => (
                    <div key={i} style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(12, 1fr)',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <div style={{
                            gridColumn: i % 2 !== 0 ? '1 / 8' : '6 / -1',
                            gridRow: '1 / -1',
                            position: 'relative',
                            zIndex: 1,
                            // Specific styles for having an image vs placeholder
                            height: project.image ? 'auto' : '360px',
                            backgroundColor: project.image ? 'transparent' : 'var(--light-navy)',
                            border: project.image ? 'none' : '1px solid var(--green)',
                            borderRadius: 'var(--border-radius)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            {project.image ? (
                                <a href={project.link} target="_blank" rel="noopener noreferrer" style={{ width: '100%', display: 'block' }}>
                                    <img
                                        src={project.image}
                                        alt={project.title}
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            borderRadius: 'var(--border-radius)',
                                            border: '1px solid var(--green)',
                                            filter: 'grayscale(100%) contrast(1) brightness(90%)',
                                            transition: 'var(--transition)',
                                            cursor: project.link ? 'pointer' : 'default',
                                            display: 'block' // Removes bottom space in anchor
                                        }}
                                        onMouseEnter={(e) => e.target.style.filter = 'none'}
                                        onMouseLeave={(e) => e.target.style.filter = 'grayscale(100%) contrast(1) brightness(90%)'}
                                    />
                                </a>
                            ) : (
                                <div style={{ color: 'var(--light-slate)' }}>Placeholder Project Image</div>
                            )}
                        </div>

                        <div style={{
                            gridColumn: i % 2 !== 0 ? '7 / -1' : '1 / 7',
                            gridRow: '1 / -1',
                            zIndex: 2,
                            textAlign: i % 2 !== 0 ? 'right' : 'left',
                            pointerEvents: 'none' // Allow clicks to pass through to image where not blocked by text
                        }}>
                            <div style={{ pointerEvents: 'auto' }}>
                                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fz-xs)', color: 'var(--green)' }}>Featured Project</p>
                                <h3 style={{ fontSize: 'clamp(24px, 5vw, 28px)', color: 'var(--lightest-slate)' }}>
                                    <a href={project.link} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{project.title}</a>
                                </h3>
                                <div style={{
                                    backgroundColor: 'var(--light-navy)',
                                    padding: '25px',
                                    borderRadius: 'var(--border-radius)',
                                    boxShadow: '0 10px 30px -15px var(--navy-shadow)',
                                    margin: '20px 0',
                                    textAlign: 'left'
                                }}>
                                    <p>{project.description}</p>
                                </div>
                                <ul style={{
                                    display: 'flex',
                                    justifyContent: i % 2 !== 0 ? 'flex-end' : 'flex-start',
                                    gap: '20px',
                                    listStyle: 'none',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 'var(--fz-xs)',
                                    color: 'var(--light-slate)'
                                }}>
                                    {project.tech.map((t, idx) => <li key={idx}>{t}</li>)}
                                </ul>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: i % 2 !== 0 ? 'flex-end' : 'flex-start',
                                    gap: '20px',
                                    marginTop: '20px'
                                }}>
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
        </section>
    );
};

export default Projects;
