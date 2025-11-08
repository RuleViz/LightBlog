import React, { useRef, useState } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { decodeImageAlt, encodeImageAlt, clampImageSize } from '@/utils/imageSize';

const ResizableImageNodeView: React.FC<NodeViewProps> = ({ node, updateAttributes, selected, getPos, editor }) => {
  const { src, alt, title } = node.attrs;
  const { altText, size } = decodeImageAlt(alt);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (typeof getPos === 'function') {
      const pos = getPos();
      if (typeof pos === 'number') {
        editor?.commands.setNodeSelection(pos);
      }
    }

    const imageEl = imageRef.current;
    if (!imageEl) return;

    const startX = event.clientX;
    const startWidthPx = imageEl.getBoundingClientRect().width;
    const containerWidth =
      wrapperRef.current?.parentElement?.getBoundingClientRect().width ??
      imageEl.parentElement?.getBoundingClientRect().width ??
      startWidthPx;

    setIsResizing(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidthPx = Math.max(24, startWidthPx + deltaX);
      const baseWidth = containerWidth || newWidthPx;
      const nextPercent = (newWidthPx / baseWidth) * 100;
      const clamped = clampImageSize(nextPercent);
      updateAttributes({
        alt: encodeImageAlt(altText, clamped),
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <NodeViewWrapper
      as="span"
      ref={wrapperRef}
      className={`resizable-image-wrapper ${selected ? 'is-selected' : ''} ${isResizing ? 'is-resizing' : ''}`}
      contentEditable={false}
    >
      <img
        ref={imageRef}
        src={src}
        alt={altText}
        title={title}
        style={{
          width: `${size}%`,
          maxWidth: '100%',
          height: 'auto',
        }}
        draggable={false}
      />
      <span
        className="resizer-handle"
        role="presentation"
        onMouseDown={handleMouseDown}
      />
      {(selected || isResizing) && (
        <span className="resizer-hint">
          {clampImageSize(size)}%
        </span>
      )}
    </NodeViewWrapper>
  );
};

export default ResizableImageNodeView;


