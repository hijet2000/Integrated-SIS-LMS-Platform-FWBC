import React, { useState, useEffect } from 'react';

export const Watermark: React.FC<{ text: string }> = ({ text }) => {
  // drift a little to resist cropping
  const [pos, setPos] = useState({ x: 8, y: 8 });
  useEffect(() => {
    const id = setInterval(() => setPos(p => ({ x: (p.x + 7) % 40, y: (p.y + 5) % 32 })), 4000);
    return () => clearInterval(id);
  }, []);
  
  return (
    <div className="pointer-events-none fixed inset-0 select-none z-50" aria-hidden>
      <div style={{ top: pos.y, left: pos.x }} className="absolute opacity-20 rotate-[-12deg]">
        <div className="text-xs md:text-sm lg:text-base whitespace-pre leading-5 text-black/40 dark:text-white/40">
          {text}
        </div>
      </div>
    </div>
  );
};

export default Watermark;
