"use client";

import React, { useReducer, useRef, useCallback, useEffect } from 'react'

type State = { rangeValue: number }
type Action = { type: 'change'; payload: number } | { type: 'move'; payload: number }

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'change':
            return { rangeValue: action.payload }
        case 'move':
            return { rangeValue: Math.min(100, Math.max(0, Math.round(action.payload))) }
        default:
            return state
    }
}

type ChangeEvent = React.ChangeEvent<HTMLInputElement>
type ReactPointerEvent = React.PointerEvent<HTMLDivElement>
type InlineStyle = React.CSSProperties

interface Props {
    beforeImage: string
    afterImage: string
    /**
     * "drag"  – default: only dragging the center button moves the slider
     * "click" – clicking/dragging anywhere on the image moves the slider
     * "hover" – hovering moves the slider
     */
    mode?: 'drag' | 'click' | 'hover'
    onChange?: (value: number) => void
    onPointerEnter?: (event: ReactPointerEvent) => void
    onPointerLeave?: (event: ReactPointerEvent) => void
    className?: string
    beforeClassName?: string
    afterClassName?: string
    buttonClassName?: string
    style?: InlineStyle
    beforeStyle?: InlineStyle
    afterStyle?: InlineStyle
    buttonStyle?: InlineStyle
}

export function BeforeAfter({
    beforeImage,
    afterImage,
    mode = 'drag',
    onChange,
    onPointerEnter,
    onPointerLeave,
    className = 'before-after-slider',
    beforeClassName = 'before',
    afterClassName = 'after',
    buttonClassName = 'resize-button',
    style,
    beforeStyle,
    afterStyle,
    buttonStyle
}: Props) {
    const [{ rangeValue }, dispatch] = useReducer(reducer, { rangeValue: 50 })
    const containerRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLDivElement>(null)
    const isDragging = useRef(false)

    const clientXToPercent = useCallback((clientX: number): number => {
        if (!containerRef.current) return 50
        const { left, width } = containerRef.current.getBoundingClientRect()
        return ((clientX - left) / width) * 100
    }, [])

    const applyPercent = useCallback((pct: number) => {
        dispatch({ type: 'move', payload: pct })
        onChange?.(Math.min(100, Math.max(0, Math.round(pct))))
    }, [onChange])

    // ── Attach non-passive touch listeners to the BUTTON only ──────────────
    // This lets us call preventDefault() to stop scroll ONLY while the user
    // is actively dragging the handle. The rest of the page scrolls freely.
    useEffect(() => {
        if (mode !== 'drag') return
        const btn = buttonRef.current
        if (!btn) return

        const onTouchStart = (e: TouchEvent) => {
            isDragging.current = true
            e.preventDefault() // prevent scroll starting when finger lands on handle
        }

        const onTouchMove = (e: TouchEvent) => {
            if (!isDragging.current) return
            e.preventDefault() // prevent scroll while dragging handle horizontally
            const touch = e.touches[0]
            applyPercent(clientXToPercent(touch.clientX))
        }

        const onTouchEnd = () => {
            isDragging.current = false
        }

        btn.addEventListener('touchstart', onTouchStart, { passive: false })
        btn.addEventListener('touchmove', onTouchMove, { passive: false })
        btn.addEventListener('touchend', onTouchEnd)

        return () => {
            btn.removeEventListener('touchstart', onTouchStart)
            btn.removeEventListener('touchmove', onTouchMove)
            btn.removeEventListener('touchend', onTouchEnd)
        }
    }, [mode, clientXToPercent, applyPercent])

    // ── DRAG mode — pointer events on button (mouse / stylus, not touch) ───
    const handleButtonPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (mode !== 'drag' || e.pointerType === 'touch') return
        e.preventDefault()
        e.stopPropagation()
        isDragging.current = true
            ; (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
    }, [mode])

    const handleButtonPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (mode !== 'drag' || e.pointerType === 'touch' || !isDragging.current) return
        e.preventDefault()
        applyPercent(clientXToPercent(e.clientX))
    }, [mode, clientXToPercent, applyPercent])

    const handleButtonPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (mode !== 'drag' || e.pointerType === 'touch') return
        isDragging.current = false
            ; (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId)
    }, [mode])

    // ── CLICK mode — pointer events on container ────────────────────────────
    const handleContainerPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (mode !== 'click') return
        applyPercent(clientXToPercent(e.clientX))
        isDragging.current = true
            ; (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
    }, [mode, clientXToPercent, applyPercent])

    const handleContainerPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (mode === 'hover') {
            applyPercent(clientXToPercent(e.clientX))
            return
        }
        if (mode === 'click' && isDragging.current) {
            applyPercent(clientXToPercent(e.clientX))
        }
    }, [mode, clientXToPercent, applyPercent])

    const handleContainerPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (mode === 'click') {
            isDragging.current = false
                ; (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId)
        }
    }, [mode])

    // ── Keyboard / accessibility ────────────────────────────────────────────
    const handleRangeChange = useCallback((e: ChangeEvent) => {
        const val = Number(e.target.value)
        dispatch({ type: 'change', payload: val })
        onChange?.(val)
    }, [onChange])

    const cursorStyle = mode === 'hover' ? 'col-resize' : 'default'

    return (
        <div
            ref={containerRef}
            className={className}
            style={{
                position: 'relative',
                overflow: 'hidden',
                width: '100%',
                minHeight: 200,
                cursor: cursorStyle,
                userSelect: 'none',
                // ✅ No touchAction — browser handles vertical scroll freely
                ...style
            }}
            onPointerDown={handleContainerPointerDown}
            onPointerMove={handleContainerPointerMove}
            onPointerUp={handleContainerPointerUp}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
        >
            {/* Before (left) image */}
            <div
                className={beforeClassName}
                style={{
                    position: 'absolute',
                    overflow: 'hidden',
                    width: `${rangeValue}%`,
                    height: '100%',
                    top: 0,
                    left: 0,
                    borderRight: '2px solid #fff',
                    zIndex: 1,
                    ...beforeStyle
                }}
            >
                <img
                    src={beforeImage}
                    alt="before"
                    draggable={false}
                    style={{ height: '100%', width: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
                />
            </div>

            {/* After (right) image — absolutely positioned so it never stretches the container */}
            <div
                className={afterClassName}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    ...afterStyle
                }}
            >
                <img
                    src={afterImage}
                    alt="after"
                    draggable={false}
                    style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover', pointerEvents: 'none' }}
                />
            </div>

            {/* Labels */}
            <span style={{
                position: 'absolute', top: 12, left: 12, zIndex: 4,
                fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
                color: '#fff', background: 'rgba(0,0,0,0.5)', padding: '3px 8px',
                backdropFilter: 'blur(4px)', fontFamily: 'Poppins, sans-serif',
                pointerEvents: 'none',
            }}>Before</span>
            <span style={{
                position: 'absolute', top: 12, right: 12, zIndex: 4,
                fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
                color: '#181B34', background: '#F5C518', padding: '3px 8px',
                fontFamily: 'Poppins, sans-serif', pointerEvents: 'none',
            }}>After</span>

            {/* Drag handle */}
            <div
                ref={buttonRef}
                className={buttonClassName}
                onPointerDown={handleButtonPointerDown}
                onPointerMove={handleButtonPointerMove}
                onPointerUp={handleButtonPointerUp}
                style={{
                    backgroundColor: '#fff',
                    position: 'absolute',
                    top: '50%',
                    left: `${rangeValue}%`,
                    transform: 'translate(-50%, -50%)',
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 3,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
                    cursor: mode === 'drag' ? 'grab' : 'inherit',
                    // pan-y: tells browser "vertical scroll is ok here"
                    // our non-passive touchmove listener overrides it only during drag
                    touchAction: 'pan-y',
                    ...buttonStyle
                }}
            >
                <svg fill="#333" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                    <path d="M24,12l-5.7-5.7V11c-3.7,0-9,0-12.6,0V6.3L0,12l5.8,5.7V13c3.6,0,8.9,0,12.5,0v4.7L24,12z" />
                </svg>
            </div>

            {/* Hidden range for keyboard accessibility */}
            <input
                type="range"
                min={0}
                max={100}
                value={rangeValue}
                name="slider"
                onChange={handleRangeChange}
                aria-label="Image comparison slider"
                style={{
                    position: 'absolute',
                    opacity: 0,
                    width: '100%',
                    height: '100%',
                    top: 0,
                    left: 0,
                    zIndex: 0,
                    pointerEvents: 'none',
                }}
                onKeyDown={(e) => {
                    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                        const val = Number((e.target as HTMLInputElement).value)
                        dispatch({ type: 'change', payload: val })
                        onChange?.(val)
                    }
                }}
            />
        </div>
    )
}