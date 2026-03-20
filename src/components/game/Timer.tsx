"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface TimerProps {
  duration: number; // Total seconds
  onComplete: () => void;
  isActive: boolean;
  serverStartTime?: number; // Server timestamp when question started (for sync)
}

export function Timer({ duration, onComplete, isActive, serverStartTime }: TimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [progress, setProgress] = useState(100);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!isActive) {
      setTimeRemaining(duration);
      setProgress(100);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const animate = () => {
      // Use server start time for synchronized timers across all clients
      const startTime = serverStartTime || Date.now();
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, duration - elapsed);
      const progressPercent = (remaining / duration) * 100;

      setTimeRemaining(Math.ceil(remaining));
      setProgress(progressPercent);

      if (remaining > 0) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [duration, isActive, onComplete, serverStartTime]);

  const getColor = () => {
    if (progress > 50) return "stroke-green-500";
    if (progress > 25) return "stroke-yellow-500";
    return "stroke-red-500";
  };

  const isPulse = timeRemaining <= 5 && timeRemaining > 0;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-700"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            className={cn(
              "transition-all duration-100",
              getColor()
            )}
          />
        </svg>
        {/* Timer number in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              "text-3xl font-bold text-white",
              isPulse && "animate-countdown"
            )}
          >
            {timeRemaining}
          </span>
        </div>
      </div>
    </div>
  );
}
