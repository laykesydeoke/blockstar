"use client";

import { Timer } from "./Timer";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  text: string;
  options: string[];
}

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  timeLimit: number;
  showAnswer: boolean;
  correctIndex?: number;
  onTimeComplete: () => void;
  serverStartTime?: number; // Server timestamp for synchronized timers
}

const answerColors = [
  "bg-answer-a",
  "bg-answer-b",
  "bg-answer-c",
  "bg-answer-d",
];

export function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
  timeLimit,
  showAnswer,
  correctIndex,
  onTimeComplete,
  serverStartTime,
}: QuestionDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-8 space-y-8">
      {/* Header with timer and question number */}
      <div className="flex items-center justify-between w-full max-w-4xl">
        <div className="text-2xl font-bold text-white">
          Question {questionNumber} / {totalQuestions}
        </div>
        <Timer
          duration={timeLimit}
          onComplete={onTimeComplete}
          isActive={!showAnswer}
          serverStartTime={serverStartTime}
        />
      </div>

      {/* Question text */}
      <div className="w-full max-w-4xl">
        <h2 className="text-4xl md:text-5xl font-bold text-white text-center leading-tight">
          {question.text}
        </h2>
      </div>

      {/* Answer options - display only (read-only) */}
      <div className="grid grid-cols-2 gap-6 w-full max-w-4xl">
        {question.options.map((option, index) => (
          <div
            key={index}
            className={cn(
              "relative flex items-center justify-center p-8 rounded-lg text-white font-semibold text-xl transition-all",
              answerColors[index],
              showAnswer && correctIndex === index && "ring-8 ring-green-500"
            )}
          >
            <span className="text-center">{option}</span>
            {showAnswer && correctIndex === index && (
              <div className="absolute top-4 right-4 bg-green-500 rounded-full p-2">
                <Check className="w-6 h-6" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
