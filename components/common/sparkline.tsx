import { cn } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  className?: string;
  strokeClassName?: string;
  fillClassName?: string;
}

export function Sparkline({
  data,
  className,
  strokeClassName = "stroke-gold",
  fillClassName = "fill-gold/10",
}: SparklineProps) {
  if (data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = 100 / (data.length - 1 || 1);
  const points = data.map((v, i) => {
    const x = i * step;
    const y = 100 - ((v - min) / range) * 100;
    return `${x},${y}`;
  });
  const pathD = `M ${points.join(" L ")}`;
  const areaD = `${pathD} L 100,100 L 0,100 Z`;
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={cn("h-6 w-20", className)}
    >
      <path d={areaD} className={fillClassName} />
      <path
        d={pathD}
        className={strokeClassName}
        fill="none"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
