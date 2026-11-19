import { useRef, useCallback } from 'react';

export function useDragScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const isDragging = useRef(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    // Only drag with primary mouse button
    if (e.button !== 0) return;
    isDown.current = true;
    isDragging.current = false;
    startX.current = e.pageX - containerRef.current.offsetLeft;
    scrollLeft.current = containerRef.current.scrollLeft;
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDown.current || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; // drag speed multiplier
    if (Math.abs(x - startX.current) > 6) {
      isDragging.current = true;
      containerRef.current.style.cursor = 'grabbing';
      containerRef.current.style.userSelect = 'none';
    }
    containerRef.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  const onMouseUpOrLeave = useCallback(() => {
    if (!isDown.current) return;
    isDown.current = false;
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
      containerRef.current.style.removeProperty('user-select');
    }
    // Prevent accidental click trigger when dragging
    setTimeout(() => {
      isDragging.current = false;
    }, 60);
  }, []);

  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (isDragging.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = containerRef.current.clientWidth * 0.75;
      containerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  }, []);

  return {
    containerRef,
    scroll,
    dragProps: {
      onMouseDown,
      onMouseMove,
      onMouseUp: onMouseUpOrLeave,
      onMouseLeave: onMouseUpOrLeave,
      onClickCapture,
      style: { cursor: 'grab' },
    },
  };
}
