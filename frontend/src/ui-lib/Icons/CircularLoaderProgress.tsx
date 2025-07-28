interface CircularLoaderProgressProps {
    percentage?: number;
    strokeColor?: string;
    size?: number;
    strokeWidth?: number;
  }
  
  const CircularLoaderProgress: React.FC<CircularLoaderProgressProps> = ({
    percentage = 0,
    strokeColor = "#2CCBE5",
    size = 16,
    strokeWidth = 3,
  }) => {
    const normalized = Math.max(0, Math.min(percentage, 100)) / 100;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - normalized);
  
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
        <path
          d={`
            M ${size / 2} ${strokeWidth / 2}
            A ${radius} ${radius} 0 1 1 ${(size / 2) - 0.01} ${strokeWidth / 2}
          `}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          fill="none"
          style={{
            transition: "stroke-dashoffset 0.4s ease-in-out",
            transformOrigin: "center",
          }}
        />
      </svg>
    );
  };
  
  export default CircularLoaderProgress;
