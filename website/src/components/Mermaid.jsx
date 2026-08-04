import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'JetBrains Mono, monospace',
});

const Mermaid = ({ chart }) => {
  const mermaidRef = useRef(null);

  useEffect(() => {
    if (mermaidRef.current) {
      mermaid.contentLoaded();
    }
  }, [chart]);

  return (
    <div
      className="mermaid"
      ref={mermaidRef}
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '2rem',
        backgroundColor: '#010409',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        overflowX: 'auto',
      }}
    >
      {chart}
    </div>
  );
};

export default Mermaid;
