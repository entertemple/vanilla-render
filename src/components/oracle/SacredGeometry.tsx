import { useEffect, useRef } from 'react';

interface SacredGeometryProps {
  dayIndex: number;
  className?: string;
  strokeColor?: string;
}

function KatharaGrid({ stroke }: { stroke: string }) {
  // 12 nodes in 3-column elongated lattice, 4 per column
  const left = [[40, 25], [40, 75], [40, 125], [40, 175]];
  const center = [[100, 15], [100, 65], [100, 115], [100, 165]];
  const right = [[160, 25], [160, 75], [160, 125], [160, 175]];
  const all = [...left, ...center, ...right];
  
  // Connection lines following grid map
  const lines: [number, number][] = [
    [0,4],[4,1],[1,5],[5,2],[2,6],[6,3],[3,7],
    [4,8],[8,5],[5,9],[9,6],[6,10],[10,7],[7,11],
    [0,1],[1,2],[2,3],[4,5],[5,6],[6,7],[8,9],[9,10],[10,11],
  ];

  return (
    <g className="geometry-strokes">
      {/* Central axis */}
      <line x1="100" y1="5" x2="100" y2="195" stroke={stroke} strokeWidth="0.5" />
      {/* Connection lines */}
      {lines.map(([a, b], i) => (
        <line key={`l${i}`} x1={all[a][0]} y1={all[a][1]} x2={all[b][0]} y2={all[b][1]} stroke={stroke} strokeWidth="0.5" />
      ))}
      {/* Nodes */}
      {all.map(([x, y], i) => (
        <circle key={`n${i}`} cx={x} cy={y} r="2.5" fill="none" stroke={stroke} strokeWidth="0.5" />
      ))}
      {/* AzurA center */}
      <circle cx="100" cy="100" r="4" fill="none" stroke={stroke} strokeWidth="0.7" />
    </g>
  );
}

function ReucheFormation({ stroke }: { stroke: string }) {
  const r = 85;
  const cx = 100, cy = 100;
  const points = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 - 90) * Math.PI / 180;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as [number, number];
  });

  return (
    <g className="geometry-strokes">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth="0.5" />
      {/* Radial lines to center */}
      {points.map(([x, y], i) => (
        <line key={`r${i}`} x1={cx} y1={cy} x2={x} y2={y} stroke={stroke} strokeWidth="0.5" />
      ))}
      {/* Cross through quadrants (12,3,6,9) */}
      <line x1={points[0][0]} y1={points[0][1]} x2={points[6][0]} y2={points[6][1]} stroke={stroke} strokeWidth="0.5" />
      <line x1={points[3][0]} y1={points[3][1]} x2={points[9][0]} y2={points[9][1]} stroke={stroke} strokeWidth="0.5" />
      {/* Octant connections */}
      {[1, 2, 4, 5, 7, 8, 10, 11].map((i) => {
        const prev = Math.floor(i / 3) * 3;
        const next = prev + 3 < 12 ? prev + 3 : 0;
        return (
          <g key={`o${i}`}>
            <line x1={points[i][0]} y1={points[i][1]} x2={points[prev][0]} y2={points[prev][1]} stroke={stroke} strokeWidth="0.3" />
          </g>
        );
      })}
      {/* Node dots */}
      {points.map(([x, y], i) => (
        <circle key={`n${i}`} cx={x} cy={y} r="2" fill="none" stroke={stroke} strokeWidth="0.5" />
      ))}
      <circle cx={cx} cy={cy} r="4" fill="none" stroke={stroke} strokeWidth="0.7" />
    </g>
  );
}

function KrystalSpiral({ stroke }: { stroke: string }) {
  const cx = 100, cy = 100;
  const sizes = [6, 12, 24, 48, 96];

  // Build spiral path through corners
  const corners: [number, number][] = [];
  sizes.forEach((s, i) => {
    const corner = i % 4;
    const x = corner === 0 || corner === 3 ? cx - s : cx + s;
    const y = corner < 2 ? cy - s : cy + s;
    corners.push([x, y]);
  });

  const spiralPath = corners.reduce((path, [x, y], i) => {
    return i === 0 ? `M ${x} ${y}` : `${path} Q ${cx} ${cy} ${x} ${y}`;
  }, '');

  return (
    <g className="geometry-strokes">
      {sizes.map((s, i) => (
        <rect
          key={`sq${i}`}
          x={cx - s} y={cy - s}
          width={s * 2} height={s * 2}
          fill="none" stroke={stroke} strokeWidth="0.5"
          opacity={0.6 - i * 0.05}
        />
      ))}
      <path d={spiralPath} fill="none" stroke={stroke} strokeWidth="0.7" />
      <circle cx={cx} cy={cy} r="2" fill="none" stroke={stroke} strokeWidth="0.5" />
    </g>
  );
}

function EckashaSymbol({ stroke }: { stroke: string }) {
  const cx = 100, cy = 100;
  const diamonds = [30, 55, 80];

  return (
    <g className="geometry-strokes">
      {/* 8 radial lines */}
      {[0, 45, 90, 135].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = cx + 95 * Math.cos(rad);
        const y1 = cy + 95 * Math.sin(rad);
        const x2 = cx - 95 * Math.cos(rad);
        const y2 = cy - 95 * Math.sin(rad);
        return <line key={`ax${angle}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth="0.4" />;
      })}
      {/* Concentric diamonds */}
      {diamonds.map((s, i) => (
        <polygon
          key={`d${i}`}
          points={`${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`}
          fill="none" stroke={stroke} strokeWidth="0.5"
        />
      ))}
      <circle cx={cx} cy={cy} r="3" fill="none" stroke={stroke} strokeWidth="0.7" />
    </g>
  );
}

function MaharicShield({ stroke }: { stroke: string }) {
  const cx = 100, cy = 100;
  const radii = [85, 60, 38];

  return (
    <g className="geometry-strokes">
      {radii.map((r, i) => (
        <circle key={`c${i}`} cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth="0.5" opacity={1 - i * 0.2} />
      ))}
      {/* Central column */}
      <line x1={cx} y1="5" x2={cx} y2="195" stroke={stroke} strokeWidth="0.5" />
      {/* 8 radial lines */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i * 45 * Math.PI) / 180;
        return (
          <line
            key={`r${i}`}
            x1={cx} y1={cy}
            x2={cx + 85 * Math.cos(angle)} y2={cy + 85 * Math.sin(angle)}
            stroke={stroke} strokeWidth="0.4"
          />
        );
      })}
      <circle cx={cx} cy={cy} r="3" fill={stroke} stroke={stroke} strokeWidth="0.5" opacity="0.5" />
    </g>
  );
}

function StarCrystalSeal({ stroke }: { stroke: string }) {
  const cx = 100, cy = 100, r = 80;
  
  // Two hexagons rotated 30°
  const hex1 = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 - 90) * Math.PI / 180;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as [number, number];
  });
  const hex2 = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 - 60) * Math.PI / 180;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as [number, number];
  });

  const toPath = (pts: [number, number][]) =>
    pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ') + ' Z';

  // Inner 12-sided polygon
  const all12 = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 - 90) * Math.PI / 180;
    const innerR = r * 0.5;
    return [cx + innerR * Math.cos(angle), cy + innerR * Math.sin(angle)] as [number, number];
  });

  return (
    <g className="geometry-strokes">
      <path d={toPath(hex1)} fill="none" stroke={stroke} strokeWidth="0.5" />
      <path d={toPath(hex2)} fill="none" stroke={stroke} strokeWidth="0.5" />
      <path d={toPath(all12)} fill="none" stroke={stroke} strokeWidth="0.3" />
      {/* Intersection points */}
      {[...hex1, ...hex2].map(([x, y], i) => (
        <circle key={`p${i}`} cx={x} cy={y} r="1.5" fill="none" stroke={stroke} strokeWidth="0.5" />
      ))}
      <circle cx={cx} cy={cy} r="3" fill="none" stroke={stroke} strokeWidth="0.7" />
    </g>
  );
}

function KrysticMerkaba({ stroke }: { stroke: string }) {
  const cx = 100, cy = 100, r = 88;

  // Two triangles
  const triUp = Array.from({ length: 3 }, (_, i) => {
    const angle = (i * 120 - 90) * Math.PI / 180;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as [number, number];
  });
  const triDown = Array.from({ length: 3 }, (_, i) => {
    const angle = (i * 120 + 90) * Math.PI / 180;
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as [number, number];
  });

  const toPath = (pts: [number, number][]) =>
    pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ') + ' Z';

  // Inner hexagon
  const hex = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 - 90) * Math.PI / 180;
    const hr = r * 0.5;
    return [cx + hr * Math.cos(angle), cy + hr * Math.sin(angle)] as [number, number];
  });

  return (
    <g className="geometry-strokes">
      <path d={toPath(triUp)} fill="none" stroke={stroke} strokeWidth="0.5" />
      <path d={toPath(triDown)} fill="none" stroke={stroke} strokeWidth="0.5" />
      <path d={toPath(hex)} fill="none" stroke={stroke} strokeWidth="0.3" />
      {/* Concentric rings */}
      {[18, 12, 6].map((r, i) => (
        <circle key={`ring${i}`} cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth="0.4" opacity={0.7 - i * 0.15} />
      ))}
      <circle cx={cx} cy={cy} r="2.5" fill="none" stroke={stroke} strokeWidth="0.7" />
    </g>
  );
}

const GEOMETRIES = [KatharaGrid, ReucheFormation, KrystalSpiral, EckashaSymbol, MaharicShield, StarCrystalSeal, KrysticMerkaba];

export default function SacredGeometry({ dayIndex, className, strokeColor = 'rgba(255,255,255,0.25)' }: SacredGeometryProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const GeometryComponent = GEOMETRIES[dayIndex % 7];

  useEffect(() => {
    if (!svgRef.current) return;
    const paths = svgRef.current.querySelectorAll('.geometry-strokes line, .geometry-strokes path, .geometry-strokes circle, .geometry-strokes rect, .geometry-strokes polygon');
    paths.forEach((el, i) => {
      const htmlEl = el as SVGElement;
      if (el instanceof SVGLineElement || el instanceof SVGPathElement || el instanceof SVGRectElement || el instanceof SVGPolygonElement) {
        const length = (el as any).getTotalLength?.() || 200;
        htmlEl.style.strokeDasharray = `${length}`;
        htmlEl.style.strokeDashoffset = `${length}`;
        htmlEl.style.animation = `svgDraw 1800ms ease-in-out ${400 + i * 60}ms forwards`;
      } else if (el instanceof SVGCircleElement) {
        const circumference = 2 * Math.PI * parseFloat(el.getAttribute('r') || '0');
        htmlEl.style.strokeDasharray = `${circumference}`;
        htmlEl.style.strokeDashoffset = `${circumference}`;
        htmlEl.style.animation = `svgDraw 1800ms ease-in-out ${400 + i * 60}ms forwards`;
      }
    });
  }, [dayIndex]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 200 200"
      className={className}
      style={{ width: '100%', height: 'auto' }}
    >
      <GeometryComponent stroke={strokeColor} />
    </svg>
  );
}
