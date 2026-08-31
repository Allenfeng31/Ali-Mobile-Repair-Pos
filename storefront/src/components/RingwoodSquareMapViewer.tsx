"use client";

import Image from "next/image";
import { Maximize2, RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

type Point = { x: number; y: number };

type RingwoodSquareMapViewerProps = {
  src: string;
  alt: string;
  sizes: string;
};

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const ZOOM_STEP = 0.5;

function clampScale(scale: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number(scale.toFixed(2))));
}

function distanceBetween([first, second]: Point[]) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function centreBetween([first, second]: Point[]) {
  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
  };
}

export default function RingwoodSquareMapViewer({ src, alt, sizes }: RingwoodSquareMapViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(MIN_SCALE);
  const [position, setPosition] = useState<Point>({ x: 0, y: 0 });
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const pointerPositions = useRef(new Map<number, Point>());
  const scaleRef = useRef(MIN_SCALE);
  const positionRef = useRef<Point>({ x: 0, y: 0 });
  const pinchStart = useRef<{ distance: number; centre: Point; scale: number; position: Point } | null>(null);
  const dragStart = useRef<{ pointerId: number; point: Point; position: Point } | null>(null);

  const resetTransform = useCallback(() => {
    scaleRef.current = MIN_SCALE;
    positionRef.current = { x: 0, y: 0 };
    setScale(MIN_SCALE);
    setPosition({ x: 0, y: 0 });
    pointerPositions.current.clear();
    pinchStart.current = null;
    dragStart.current = null;
  }, []);

  const setViewerScale = useCallback((nextScale: number) => {
    const clampedScale = clampScale(nextScale);
    scaleRef.current = clampedScale;
    setScale(clampedScale);
    if (clampedScale === MIN_SCALE) {
      positionRef.current = { x: 0, y: 0 };
      setPosition({ x: 0, y: 0 });
    }
  }, []);

  const closeViewer = useCallback(() => {
    resetTransform();
    setIsOpen(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }, [resetTransform]);

  useEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      if (typeof dialog.showModal === "function") {
        try {
          dialog.showModal();
        } catch {
          dialog.setAttribute("open", "");
        }
      } else {
        dialog.setAttribute("open", "");
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      if (dialog?.open && typeof dialog.close === "function") {
        dialog.close();
      } else {
        dialog?.removeAttribute("open");
      }
    };
  }, [isOpen]);

  const releasePointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointerPositions.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    pinchStart.current = null;
    if (dragStart.current?.pointerId === event.pointerId) dragStart.current = null;
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    pointerPositions.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    const points = Array.from(pointerPositions.current.values());
    if (points.length === 2) {
      pinchStart.current = {
        distance: distanceBetween(points),
        centre: centreBetween(points),
        scale: scaleRef.current,
        position: positionRef.current,
      };
      dragStart.current = null;
      return;
    }

    dragStart.current = {
      pointerId: event.pointerId,
      point: { x: event.clientX, y: event.clientY },
      position: positionRef.current,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointerPositions.current.has(event.pointerId)) return;

    pointerPositions.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = Array.from(pointerPositions.current.values());

    if (points.length === 2 && pinchStart.current) {
      event.preventDefault();
      const currentDistance = distanceBetween(points);
      const currentCentre = centreBetween(points);
      if (pinchStart.current.distance > 0) {
        setViewerScale(pinchStart.current.scale * (currentDistance / pinchStart.current.distance));
      }
      const nextPosition = {
        x: pinchStart.current.position.x + currentCentre.x - pinchStart.current.centre.x,
        y: pinchStart.current.position.y + currentCentre.y - pinchStart.current.centre.y,
      };
      positionRef.current = nextPosition;
      setPosition(nextPosition);
      return;
    }

    if (points.length === 1 && dragStart.current?.pointerId === event.pointerId && scaleRef.current > MIN_SCALE) {
      event.preventDefault();
      const nextPosition = {
        x: dragStart.current.position.x + event.clientX - dragStart.current.point.x,
        y: dragStart.current.position.y + event.clientY - dragStart.current.point.y,
      };
      positionRef.current = nextPosition;
      setPosition(nextPosition);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open location map"
        aria-describedby="location-map-enlarge-hint"
        onClick={() => setIsOpen(true)}
        className="group mt-7 block w-full cursor-zoom-in overflow-hidden rounded-[22px] border border-slate-200 bg-slate-50 text-left shadow-[0_18px_45px_-34px_rgba(15,23,42,0.55)] transition-[border-color,box-shadow] duration-200 hover:border-blue-200 hover:shadow-[0_22px_54px_-36px_rgba(15,23,42,0.62)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-4"
      >
        <Image
          src={src}
          alt={alt}
          width={1448}
          height={1086}
          sizes={sizes}
          loading="lazy"
          className="h-auto w-full"
        />
      </button>
      <p id="location-map-enlarge-hint" className="mt-3 flex items-center justify-center gap-2 text-center text-sm font-semibold text-slate-600">
        <Maximize2 size={16} strokeWidth={2.3} aria-hidden="true" />
        Tap map to enlarge
      </p>

      {isOpen && (
        <dialog
          ref={dialogRef}
          aria-label="Location map viewer"
          aria-modal="true"
          onCancel={(event) => {
            event.preventDefault();
            closeViewer();
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) closeViewer();
          }}
          className="fixed inset-0 m-0 h-[100dvh] w-screen max-w-none overflow-hidden border-0 bg-slate-950/90 p-0 text-white"
        >
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close location map"
            onClick={closeViewer}
            className="absolute left-[max(1rem,env(safe-area-inset-left))] top-[max(1rem,env(safe-area-inset-top))] z-10 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/25 bg-slate-950/75 text-white shadow-lg backdrop-blur transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            <X size={22} strokeWidth={2.5} aria-hidden="true" />
          </button>

          <div className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-slate-950/75 p-1.5 shadow-lg backdrop-blur">
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() => setViewerScale(scaleRef.current - ZOOM_STEP)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ZoomOut size={19} strokeWidth={2.4} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Reset zoom"
              onClick={resetTransform}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <RotateCcw size={18} strokeWidth={2.4} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Zoom in"
              onClick={() => setViewerScale(scaleRef.current + ZOOM_STEP)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ZoomIn size={19} strokeWidth={2.4} aria-hidden="true" />
            </button>
          </div>

          <div
            data-testid="location-map-zoom-surface"
            data-scale={scale}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={releasePointer}
            onPointerCancel={releasePointer}
            className="flex h-full w-full touch-none items-center justify-center overflow-hidden px-4 py-20 sm:px-10"
          >
            <Image
              src={src}
              alt={alt}
              width={1448}
              height={1086}
              sizes="100vw"
              className="max-h-full max-w-full select-none object-contain transition-transform duration-150 ease-out"
              style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})` }}
            />
          </div>
        </dialog>
      )}
    </>
  );
}
