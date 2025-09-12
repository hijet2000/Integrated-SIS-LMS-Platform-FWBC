import React, { useEffect, useRef } from 'react';

const EBookReader = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const preventDefault = (e: Event) => e.preventDefault();
        const el = containerRef.current;
        if (el) {
            el.addEventListener('contextmenu', preventDefault);
            el.style.userSelect = 'none';
        }
        return () => {
            if (el) {
                el.removeEventListener('contextmenu', preventDefault);
            }
        };
    }, []);

    return (
        <div ref={containerRef} className="bg-gray-100 dark:bg-gray-900 border rounded-lg p-8 text-center select-none">
            <h2 className="text-2xl font-bold">eBook Reader</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
                This is a secure eBook viewer. Content is rendered page-by-page.
                <br/>
                Right-click, text selection, and printing are disabled.
            </p>
            <div className="mt-8 flex justify-center items-center gap-4">
                <button className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded">&larr; Previous Page</button>
                <span>Page 1 of 120</span>
                <button className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded">Next Page &rarr;</button>
            </div>
        </div>
    );
};

export default EBookReader;
