import React, { useRef, useState, useCallback, useEffect } from 'react';

interface KnobProps {
  label: string;
  value: number; // typically 0 to 1
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  unit?: string;
  size?: number;
  onChange: (value: number) => void;
  formatValue?: (val: number) => string;
}

export const Knob: React.FC<KnobProps> = ({
  label,
  value,
  min = 0,
  max = 1,
  step = 0.01,
  defaultValue = 0.5,
  unit = '',
  size = 54,
  onChange,
  formatValue,
}) => {
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef<number>(0);
  const dragStartValue = useRef<number>(0);

  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));

  // Arc angles: from -135 deg (bottom-left) to +135 deg (bottom-right) => 270 deg range
  const startAngle = -135;
  const endAngle = 135;
  const currentAngle = startAngle + normalized * (endAngle - startAngle);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartValue.current = value;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const deltaY = dragStartY.current - e.clientY;
      const sensitivity = e.shiftKey ? 0.001 : 0.005;
      const range = max - min;
      const deltaValue = deltaY * sensitivity * range;
      let nextValue = dragStartValue.current + deltaValue;

      if (step > 0) {
        nextValue = Math.round(nextValue / step) * step;
      }
      nextValue = Math.max(min, Math.min(max, nextValue));
      onChange(nextValue);
    },
    [isDragging, max, min, step, onChange]
  );

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const handleDoubleClick = () => {
    onChange(defaultValue);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -Math.sign(e.deltaY) * (step || 0.02) * (e.shiftKey ? 0.2 : 1);
    const nextValue = Math.max(min, Math.min(max, value + delta));
    onChange(nextValue);
  };

  // SVG Geometry
  const radius = (size - 10) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  // 270 / 360 = 0.75
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - normalized * arcLength;

  const displayString = formatValue
    ? formatValue(value)
    : `${unit === '%' ? Math.round(normalized * 100) : (max <= 1 ? Math.round(value * 100) : value.toFixed(1))}${unit}`;

  return (
    <div className="flex flex-col items-center select-none group">
      <div
        ref={knobRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        className="relative touch-none cursor-ns-resize"
        style={{ width: size, height: size }}
        title={`${label}: ${displayString} (Double-click to reset)`}
      >
        {/* Background track & active arc SVG */}
        <svg width={size} height={size} className="transform rotate-[135deg] pointer-events-none">
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#1E293B"
            strokeWidth="3.5"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Active colored arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={isDragging ? '#FBBF24' : '#F59E0B'}
            strokeWidth="3.5"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-[stroke] duration-150"
          />
        </svg>

        {/* Central Knob Body */}
        <div
          className={`absolute rounded-full inset-[5px] flex items-center justify-center transition-all ${
            isDragging
              ? 'bg-[#151D2C] ring-1 ring-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
              : 'bg-[#101724] border border-slate-800/90 group-hover:border-slate-700 shadow-inner'
          }`}
        >
          {/* Subtle radial sheen */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/50 via-transparent to-white/5 pointer-events-none" />

          {/* Pointer Tick */}
          <div
            className="absolute w-full h-full flex items-start justify-center pt-[3px] pointer-events-none transition-transform"
            style={{ transform: `rotate(${currentAngle}deg)` }}
          >
            <div
              className={`w-[2px] h-[7px] rounded-full ${
                isDragging ? 'bg-amber-400 shadow-[0_0_6px_#F59E0B]' : 'bg-slate-300'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Label and Value Display */}
      <span className="text-[11px] font-medium text-slate-300 mt-1.5 whitespace-nowrap tracking-tight">
        {label}
      </span>
      <span className="text-[10px] font-mono tabular-nums text-amber-500/90 tracking-tighter">
        {displayString}
      </span>
    </div>
  );
};
