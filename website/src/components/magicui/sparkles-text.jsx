import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SparklesText = ({
  text,
  colors = { first: "#9E7AFF", second: "#FE8BBB" },
  className,
  sparklesCount = 10,
  ...props
}) => {
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    const generateSparkles = () => {
      return Array.from({ length: sparklesCount }).map((_, i) => ({
        id: `sparkle-${i}-${Math.random()}`,
        x: Math.random() * 100 + "%",
        y: Math.random() * 100 + "%",
        color: Math.random() > 0.5 ? colors.first : colors.second,
        delay: Math.random() * 2 + "s",
        scale: Math.random() * 0.5 + 0.5,
      }));
    };
    setSparkles(generateSparkles());
  }, [sparklesCount, colors.first, colors.second]);

  return (
    <div
      className={cn("text-5xl font-bold relative inline-block", className)}
      {...props}
    >
      {sparkles.map((sparkle) => (
        <span
          key={sparkle.id}
          className="absolute block animate-sparkle"
          style={{
            top: sparkle.y,
            left: sparkle.x,
            color: sparkle.color,
            animationDelay: sparkle.delay,
            transform: `scale(${sparkle.scale})`,
          }}
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 68 68"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M26.5 25.5C19.0043 33.3697 0 34 0 34C0 34 19.1013 35.3684 26.5 43.5C33.234 50.901 34 68 34 68C34 68 36.9884 50.7065 44.5 43.5C51.6431 36.647 68 34 68 34C68 34 51.6947 32.0939 44.5 25.5C36.5605 18.2235 34 0 34 0C34 0 33.6591 17.9837 26.5 25.5Z"
              fill="currentColor"
            />
          </svg>
        </span>
      ))}
      <strong className="relative z-10 font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-200 to-neutral-500">
        {text}
      </strong>
    </div>
  );
};

export default SparklesText;
