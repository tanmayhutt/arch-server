import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { ScanSearch } from 'lucide-react';

mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'JetBrains Mono, monospace',
});

const Mermaid = ({ chart }) => {
  const [svgContent, setSvgContent] = useState('');

  useEffect(() => {
    // Generate a unique ID for this diagram
    const id = `mermaid-svg-${Math.round(Math.random() * 10000)}`;

    // Render the mermaid chart directly to an SVG string
    mermaid
      .render(id, chart)
      .then((result) => {
        // Inject CSS into the SVG string to force it to render at its native, lossless size
        // rather than shrinking to fit the container width (which makes it look blurry).
        let svg = result.svg;
        svg = svg.replace('<svg ', '<svg style="max-width: none !important; height: auto;" ');
        setSvgContent(svg);
      })
      .catch((error) => {
        console.error('Mermaid parsing error:', error);
        setSvgContent(
          `<div style="color: red; padding: 20px;"><pre>${error.message || error}</pre></div>`,
        );
      });
  }, [chart]);

  return (
    <div
      style={{
        backgroundColor: '#010409',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        position: 'relative',
        height: '600px', // Fixed height container for panning/zooming
        width: '100%',
        cursor: 'grab',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 10,
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ScanSearch size={13} /> Scroll to zoom, drag to pan
        </span>
      </div>

      {svgContent ? (
        <TransformWrapper
          initialScale={1}
          minScale={0.1}
          maxScale={5}
          centerOnInit={true}
          wheel={{ step: 0.1 }}
        >
          <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
            <div dangerouslySetInnerHTML={{ __html: svgContent }} />
          </TransformComponent>
        </TransformWrapper>
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: 'var(--text-secondary)',
          }}
        >
          Rendering architecture...
        </div>
      )}
    </div>
  );
};

export default Mermaid;
