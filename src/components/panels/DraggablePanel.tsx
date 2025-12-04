'use client';

import { useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import clsx from 'clsx';
import {
  GripVertical,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  X,
  Maximize2,
  Minimize2,
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface DraggablePanelProps {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  children: ReactNode;
  
  // Initial position/size
  initialPosition?: Position;
  initialSize?: Size;
  
  // Constraints
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  
  // State
  collapsed?: boolean;
  onCollapse?: () => void;
  onClose?: () => void;
  
  // Reordering (for panel stack)
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  
  // Container bounds
  containerRef?: React.RefObject<HTMLDivElement | null>;
  
  className?: string;
}

// =============================================================================
// DRAGGABLE PANEL COMPONENT
// =============================================================================

export function DraggablePanel({
  id,
  title,
  icon: Icon,
  accent,
  children,
  initialPosition = { x: 0, y: 0 },
  initialSize = { width: 340, height: 500 },
  minWidth = 280,
  maxWidth = 600,
  minHeight = 200,
  maxHeight = 800,
  collapsed = false,
  onCollapse,
  onClose,
  onMoveLeft,
  onMoveRight,
  canMoveLeft = false,
  canMoveRight = false,
  containerRef,
  className,
}: DraggablePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>(initialPosition);
  const [size, setSize] = useState<Size>(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  
  const dragStart = useRef({ x: 0, y: 0 });
  const positionStart = useRef({ x: 0, y: 0 });
  const sizeStart = useRef({ width: 0, height: 0 });
  const preMaximizeState = useRef({ position: { x: 0, y: 0 }, size: { width: 340, height: 500 } });

  // Get container bounds
  const getContainerBounds = useCallback(() => {
    if (containerRef?.current) {
      const rect = containerRef.current.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }
    return { width: window.innerWidth, height: window.innerHeight };
  }, [containerRef]);

  // Handle drag start
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (isMaximized) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    positionStart.current = { ...position };
  }, [position, isMaximized]);

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent, direction: string) => {
    if (isMaximized) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(direction);
    dragStart.current = { x: e.clientX, y: e.clientY };
    sizeStart.current = { ...size };
    positionStart.current = { ...position };
  }, [size, position, isMaximized]);

  // Handle mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.current.x;
        const deltaY = e.clientY - dragStart.current.y;
        const bounds = getContainerBounds();
        
        const newX = Math.max(0, Math.min(bounds.width - size.width, positionStart.current.x + deltaX));
        const newY = Math.max(0, Math.min(bounds.height - size.height, positionStart.current.y + deltaY));
        
        setPosition({ x: newX, y: newY });
      } else if (isResizing) {
        const deltaX = e.clientX - dragStart.current.x;
        const deltaY = e.clientY - dragStart.current.y;
        const bounds = getContainerBounds();
        
        let newWidth = sizeStart.current.width;
        let newHeight = sizeStart.current.height;
        let newX = positionStart.current.x;
        let newY = positionStart.current.y;
        
        // Handle different resize directions
        if (isResizing.includes('e')) {
          newWidth = Math.max(minWidth, Math.min(maxWidth, sizeStart.current.width + deltaX));
        }
        if (isResizing.includes('w')) {
          const widthDelta = Math.max(minWidth, Math.min(maxWidth, sizeStart.current.width - deltaX)) - sizeStart.current.width;
          newWidth = sizeStart.current.width + Math.abs(widthDelta);
          newX = positionStart.current.x - Math.abs(widthDelta) * Math.sign(-deltaX);
        }
        if (isResizing.includes('s')) {
          newHeight = Math.max(minHeight, Math.min(maxHeight, sizeStart.current.height + deltaY));
        }
        if (isResizing.includes('n')) {
          const heightDelta = Math.max(minHeight, Math.min(maxHeight, sizeStart.current.height - deltaY)) - sizeStart.current.height;
          newHeight = sizeStart.current.height + Math.abs(heightDelta);
          newY = positionStart.current.y - Math.abs(heightDelta) * Math.sign(-deltaY);
        }
        
        // Clamp to bounds
        newX = Math.max(0, Math.min(bounds.width - newWidth, newX));
        newY = Math.max(0, Math.min(bounds.height - newHeight, newY));
        
        setSize({ width: newWidth, height: newHeight });
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, getContainerBounds, minWidth, maxWidth, minHeight, maxHeight, size.width, size.height]);

  // Handle maximize/restore
  const handleMaximize = useCallback(() => {
    if (isMaximized) {
      setPosition(preMaximizeState.current.position);
      setSize(preMaximizeState.current.size);
    } else {
      preMaximizeState.current = { position, size };
      const bounds = getContainerBounds();
      setPosition({ x: 20, y: 20 });
      setSize({ width: bounds.width - 40, height: bounds.height - 40 });
    }
    setIsMaximized(!isMaximized);
  }, [isMaximized, position, size, getContainerBounds]);

  if (collapsed) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      className={clsx(
        'absolute flex flex-col rounded-2xl border border-white/30 bg-white/95 shadow-2xl backdrop-blur-xl overflow-hidden',
        isDragging && 'cursor-grabbing',
        isResizing && 'cursor-' + (isResizing.length === 2 ? isResizing + '-resize' : isResizing === 'n' || isResizing === 's' ? 'ns-resize' : 'ew-resize'),
        className
      )}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: isDragging || isResizing ? 100 : 50,
      }}
    >
      {/* Header - Draggable */}
      <div
        className={clsx(
          'flex items-center justify-between border-b border-gray-100 px-3 py-2',
          !isMaximized && 'cursor-grab'
        )}
        style={{ backgroundColor: `${accent}10` }}
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2" style={{ color: accent }}>
          <GripVertical className="h-4 w-4 opacity-50" />
          <Icon className="h-4 w-4" />
          <span className="text-sm font-semibold">{title}</span>
        </div>
        <div className="flex items-center gap-0.5">
          {onMoveLeft && (
            <button
              onClick={onMoveLeft}
              disabled={!canMoveLeft}
              className={clsx(
                'p-1 rounded transition-colors',
                canMoveLeft ? 'hover:bg-gray-100 text-gray-400' : 'opacity-30 cursor-not-allowed text-gray-300'
              )}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          )}
          {onMoveRight && (
            <button
              onClick={onMoveRight}
              disabled={!canMoveRight}
              className={clsx(
                'p-1 rounded transition-colors',
                canMoveRight ? 'hover:bg-gray-100 text-gray-400' : 'opacity-30 cursor-not-allowed text-gray-300'
              )}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={handleMaximize}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 transition-colors"
            onMouseDown={(e) => e.stopPropagation()}
            title={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
          {onCollapse && (
            <button
              onClick={onCollapse}
              className="p-1 rounded hover:bg-gray-100 text-gray-400 transition-colors"
              onMouseDown={(e) => e.stopPropagation()}
              title="Collapse"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100 text-gray-400 transition-colors"
              onMouseDown={(e) => e.stopPropagation()}
              title="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {children}
      </div>

      {/* Resize handles */}
      {!isMaximized && (
        <>
          {/* Edges */}
          <div
            className="absolute top-0 left-2 right-2 h-1 cursor-n-resize hover:bg-[#006E51]/20"
            onMouseDown={(e) => handleResizeStart(e, 'n')}
          />
          <div
            className="absolute bottom-0 left-2 right-2 h-1 cursor-s-resize hover:bg-[#006E51]/20"
            onMouseDown={(e) => handleResizeStart(e, 's')}
          />
          <div
            className="absolute left-0 top-2 bottom-2 w-1 cursor-w-resize hover:bg-[#006E51]/20"
            onMouseDown={(e) => handleResizeStart(e, 'w')}
          />
          <div
            className="absolute right-0 top-2 bottom-2 w-1 cursor-e-resize hover:bg-[#006E51]/20"
            onMouseDown={(e) => handleResizeStart(e, 'e')}
          />
          {/* Corners */}
          <div
            className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize"
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          />
          <div
            className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize"
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          />
          <div
            className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize"
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          />
          <div
            className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />
        </>
      )}
    </div>
  );
}

export default DraggablePanel;

