import React, { useState, useEffect } from 'react';

const Loader = ({ finishLoading }) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => setIsMounted(true), 10);
        // Animate out after 2s (or however long we want the loader to show)
        // The parent controls when to unmount this component usually, but we can call a callback
        // to signal "ready".
        // For now, this component just renders the SVG. logic is in App.jsx mostly or here.
        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className="loader-wrapper">
            <div className="loader-logo">
                <svg id="logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                    <title>Loader Logo</title>
                    <g>
                        <path
                            stroke="currentColor"
                            strokeWidth="5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M 50, 5
                 L 11, 27
                 L 11, 72
                 L 50, 95
                 L 89, 73
                 L 89, 28 z"
                            className="hex"
                        />
                        <text x="50" y="62" textAnchor="middle" fontSize="35px" fill="currentColor" fontWeight="bold" fontFamily="var(--font-mono)">
                            mW
                        </text>
                    </g>
                </svg>
            </div>
        </div>
    );
};

export default Loader;
