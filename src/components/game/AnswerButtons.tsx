"use client";

import { Triangle, Square, Circle, Diamond } from "lucide-react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnswerButtonsProps {
  options: [string, string, string, string];
  onSelect: (index: number) => void;
  disabled: boolean;
  selectedIndex: number | null;
  correctIndex?: number | null;
}

const answerStyles = [
  {
    color: "answer-a",
    bg: "bg-answer-a",
    hover: "hover:bg-answer-a/90",
    border: "border-answer-a",
    icon: Triangle,
  },
  {
    color: "answer-b",
    bg: "bg-answer-b",
    hover: "hover:bg-answer-b/90",
    border: "border-answer-b",
    icon: Diamond,
  },
  {
    color: "answer-c",
    bg: "bg-answer-c",
    hover: "hover:bg-answer-c/90",
    border: "border-answer-c",
    icon: Circle,
  },
  {
    color: "answer-d",
    bg: "bg-answer-d",
    hover: "hover:bg-answer-d/90",
    border: "border-answer-d",
    icon: Square,
  },
];

export function AnswerButtons({
  options,
  onSelect,
  disabled,
  selectedIndex,
  correctIndex,
}: AnswerButtonsProps) {
  const showResults = correctIndex !== null && correctIndex !== undefined;

  return (
    <div className="grid grid-cols-2 gap-4 w-full max-w-2xl mx-auto">
      {options.map((option, index) => {
        const style = answerStyles[index];
        const Icon = style.icon;
        const isSelected = selectedIndex === index;
        const isCorrect = showResults && correctIndex === index;
        const isWrong = showResults && isSelected && correctIndex !== index;

        return (
          <button
            key={index}
            onClick={() => !disabled && onSelect(index)}
            disabled={disabled}
            className={cn(
              "relative flex flex-col items-center justify-center gap-3 p-6 rounded-lg font-semibold text-white transition-all transform active:scale-95",
              "min-h-[120px]",
              style.bg,
              !disabled && !showResults && style.hover,
              disabled && "opacity-50 cursor-not-allowed",
              isSelected && !showResults && "ring-4 ring-white",
              isCorrect && "ring-4 ring-green-500",
              isWrong && "ring-4 ring-red-500"
            )}
          >
            {/* Icon */}
            <Icon className="w-8 h-8" />

            {/* Option text */}
            <span className="text-center text-sm sm:text-base">{option}</span>

            {/* Result indicators */}
            {showResults && isCorrect && (
              <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                <Check className="w-5 h-5" />
              </div>
            )}
            {showResults && isWrong && (
              <div className="absolute top-2 right-2 bg-red-500 rounded-full p-1">
                <X className="w-5 h-5" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
