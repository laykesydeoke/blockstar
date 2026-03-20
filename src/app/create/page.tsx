"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useStacks } from "@/providers/StacksProvider";
import { useContract } from "@/hooks/useContract";
import { useGameStore } from "@/stores/gameStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, Loader2, BookOpen, Blocks } from "lucide-react";
import Link from "next/link";
import { nanoid } from "nanoid";

const questionSchema = z.object({
  text: z.string().min(10, "Question must be at least 10 characters"),
  options: z.array(z.string().min(1, "Option cannot be empty")).length(4, "Must have exactly 4 options"),
  correctIndex: z.number().min(0).max(3),
  timeLimit: z.number().min(5).max(120),
});

const gameSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  prizeAmount: z.number().min(1, "Prize must be at least 1 STX"),
  questions: z.array(questionSchema).min(3, "Must have at least 3 questions"),
  minPlayers: z.number().min(2, "Must allow at least 2 players"),
  maxPlayers: z.number().min(2, "Must allow at least 2 players"),
});

type GameFormData = z.infer<typeof gameSchema>;

type Question = z.infer<typeof questionSchema>;

export default function CreateGamePage() {
  const router = useRouter();
  const { isConnected, address, connect } = useStacks();
  const { createGame } = useContract();

  const [questions, setQuestions] = useState<Question[]>([
    { text: "", options: ["", "", "", ""], correctIndex: 0, timeLimit: 30 },
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form BEFORE any conditional returns (Rules of Hooks)
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<GameFormData>({
    resolver: zodResolver(gameSchema),
    defaultValues: {
      title: "",
      prizeAmount: 5,
      questions: questions,
      minPlayers: 2,
      maxPlayers: 50,
    },
  });

  // Redirect to home if not connected
  useEffect(() => {
    if (!isConnected) {
      const timer = setTimeout(() => {
        if (!isConnected) {
          alert("Please connect your wallet to create a game");
          router.push("/");
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, router]);

  // Show loading while checking connection
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#070B1A] via-[#0C1024] to-[#070B1A] flex items-center justify-center">
        <Card className="p-12 text-center bg-gradient-to-br from-[#0F1629] to-[#080D1F] shadow-2xl shadow-lab-blue/10 border-0">
          <Blocks className="w-16 h-16 text-lab-blue mx-auto mb-4 animate-pulse drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
          <p className="text-lab-grey">Checking wallet connection...</p>
        </Card>
      </div>
    );
  }

  const addQuestion = () => {
    const newQuestion: Question = {
      text: "",
      options: ["", "", "", ""],
      correctIndex: 0,
      timeLimit: 30,
    };
    const updated = [...questions, newQuestion];
    setQuestions(updated);
    setValue("questions", updated);
  };

  const removeQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
    setValue("questions", updated);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
    setValue("questions", updated);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
    setValue("questions", updated);
  };

  const onSubmit = async (data: GameFormData) => {
    console.log("📝 Form submitted with data:", data);

    if (!isConnected || !address) {
      console.log("⚠️ Wallet not connected, prompting connection...");
      await connect();
      return;
    }

    console.log("✅ Wallet connected, address:", address);

    // Reset game state before creating new game
    useGameStore.getState().reset();

    setIsCreating(true);
    setError(null);

    try {
      const gameId = nanoid(12);
      console.log("🎲 Generated game ID:", gameId);

      // Create game on blockchain
      console.log("🔗 Creating game on blockchain...");
      const txid = await createGame(gameId, data.prizeAmount);
      console.log("✅ Blockchain transaction successful, txid:", txid);

      // Create game on server
      console.log("📡 Creating game on server...");
      const response = await fetch("/api/create-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId,
          hostAddress: address,
          title: data.title,
          prizePool: data.prizeAmount * 1000000, // Convert to microSTX
          questions: data.questions.map((q, idx) => ({
            id: `q-${idx}`,
            ...q,
          })),
          settings: {
            minPlayers: data.minPlayers,
            maxPlayers: data.maxPlayers,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Server error:", errorText);
        throw new Error("Failed to create game on server");
      }

      console.log("✅ Game created on server successfully");

      // Redirect to host page
      console.log("🚀 Redirecting to host page...");
      router.push(`/host/${gameId}`);
    } catch (err: any) {
      console.error("❌ Error creating game:", err);
      console.error("Error details:", {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      setError(err.message || "Failed to create game");
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070B1A] via-[#0C1024] to-[#070B1A] p-8">
      <div className="max-w-4xl mx-auto">
        {/* Decorative glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-lab-blue/5 rounded-full blur-3xl -z-10"></div>

        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4 text-lab-blue hover:bg-lab-blue/20 hover:text-lab-purple hover:scale-105 transition-all duration-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-3 group">
            <BookOpen className="w-10 h-10 text-lab-blue drop-shadow-[0_0_10px_rgba(99,102,241,0.3)] group-hover:scale-110 transition-transform duration-300" />
            <h1 className="text-5xl font-display font-bold bg-gradient-to-r from-lab-white via-lab-blue to-lab-white bg-clip-text text-transparent">Create Learning Session</h1>
          </div>
          <p className="text-lab-grey pl-13">Design your blockchain educational quiz with Bitcoin rewards</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Game Settings */}
          <Card className="p-6 bg-gradient-to-br from-[#0F1629] to-[#080D1F] shadow-xl hover:shadow-2xl hover:shadow-lab-blue/10 transition-all duration-500 border-0">
            <h2 className="text-2xl font-display font-bold text-lab-white mb-6">Session Configuration</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-lab-blue mb-2">
                  Session Title
                </label>
                <Input
                  {...register("title")}
                  placeholder="e.g., Bitcoin Fundamentals Quiz"
                  className="bg-[#070B1A] border-0 text-lab-white placeholder:text-lab-grey-dark focus:ring-2 focus:ring-lab-blue shadow-inner"
                />
                {errors.title && (
                  <p className="text-error text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-lab-blue mb-2">
                  Reward Pool (STX)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="1"
                  {...register("prizeAmount", { valueAsNumber: true })}
                  placeholder="5"
                  className="bg-[#070B1A] border-0 text-lab-white placeholder:text-lab-grey-dark focus:ring-2 focus:ring-lab-blue shadow-inner"
                />
                {errors.prizeAmount && (
                  <p className="text-error text-sm mt-1">{errors.prizeAmount.message}</p>
                )}
                <p className="text-sm text-lab-grey-dark mt-2 font-mono">
                  Distribution: 50% → 1st place • 30% → 2nd place • 20% → 3rd place
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-lab-blue mb-2">
                    Min Learners
                  </label>
                  <Input
                    type="number"
                    min="2"
                    {...register("minPlayers", { valueAsNumber: true })}
                    className="bg-[#070B1A] border-0 text-lab-white focus:ring-2 focus:ring-lab-blue shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lab-blue mb-2">
                    Max Learners
                  </label>
                  <Input
                    type="number"
                    min="2"
                    max="100"
                    {...register("maxPlayers", { valueAsNumber: true })}
                    className="bg-[#070B1A] border-0 text-lab-white focus:ring-2 focus:ring-lab-blue shadow-inner"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold text-lab-white">Knowledge Blocks</h2>
              <Button
                type="button"
                onClick={addQuestion}
                size="sm"
                className="bg-lab-blue/20 text-lab-blue hover:bg-lab-blue hover:text-lab-black border-0 shadow-lg shadow-lab-blue/20 hover:shadow-xl hover:shadow-lab-blue/30 hover:scale-105 transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Block
              </Button>
            </div>

            {questions.map((question, qIndex) => (
              <Card key={qIndex} className="p-6 bg-gradient-to-br from-[#0F1629] to-[#080D1F] shadow-xl hover:shadow-2xl hover:shadow-lab-blue/10 transition-all duration-500 border-0">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Blocks className="w-6 h-6 text-lab-blue" />
                    <h3 className="text-lg font-display font-semibold text-lab-white">
                      Block {qIndex + 1}
                    </h3>
                  </div>
                  {questions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(qIndex)}
                      className="hover:bg-error/10"
                    >
                      <Trash2 className="w-4 h-4 text-error" />
                    </Button>
                  )}
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-lab-blue mb-2">
                      Question
                    </label>
                    <Input
                      value={question.text}
                      onChange={(e) => updateQuestion(qIndex, "text", e.target.value)}
                      placeholder="What concept are you testing?"
                      className="bg-[#070B1A] border-0 text-lab-white placeholder:text-lab-grey-dark focus:ring-2 focus:ring-lab-blue shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-lab-blue mb-2">
                      Answer Choices
                    </label>
                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-3">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={question.correctIndex === oIndex}
                            onChange={() => updateQuestion(qIndex, "correctIndex", oIndex)}
                            className="w-4 h-4 text-lab-blue accent-lab-blue cursor-pointer"
                          />
                          <Input
                            value={option}
                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                            className="bg-[#070B1A] border-0 text-lab-white placeholder:text-lab-grey-dark focus:ring-2 focus:ring-lab-blue shadow-inner flex-1"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-lab-grey-dark mt-2">
                      Mark the correct answer with the radio button
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-lab-blue mb-2">
                      Time Limit (seconds)
                    </label>
                    <Input
                      type="number"
                      min="5"
                      max="120"
                      value={question.timeLimit}
                      onChange={(e) =>
                        updateQuestion(qIndex, "timeLimit", parseInt(e.target.value))
                      }
                      className="bg-[#070B1A] border-0 text-lab-white focus:ring-2 focus:ring-lab-blue shadow-inner w-32"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {errors.questions && (
            <p className="text-error text-sm">{errors.questions.message}</p>
          )}

          {error && (
            <div className="p-4 bg-gradient-to-r from-error/20 to-error/10 rounded-lg shadow-lg shadow-error/20 border-0">
              <p className="text-error">{error}</p>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-lab-blue text-lab-black hover:bg-lab-purple font-semibold shadow-lg shadow-lab-blue/30 hover:shadow-xl hover:shadow-lab-blue/40 hover:scale-105 transition-all duration-300"
              size="lg"
              disabled={isCreating}
              loading={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Session...
                </>
              ) : (
                <>
                  <BookOpen className="w-5 h-5 mr-2" />
                  Create Learning Session
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
