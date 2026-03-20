"use client";

export const dynamic = 'force-dynamic';

import Link from "next/link";
import { Blocks, Wallet, Trophy, Users, BookOpen, Shield, Network, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStacks } from "@/providers/StacksProvider";

export default function HomePage() {
  const { isConnected, address, connect, disconnect } = useStacks();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070B1A] via-[#0C1024] to-[#070B1A]">
      {/* Header with Wallet */}
      <div className="backdrop-blur-sm bg-black/30 shadow-lg shadow-lab-blue/5">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 group cursor-pointer">
              <Blocks className="w-8 h-8 text-lab-blue group-hover:text-lab-purple transition-all duration-300 group-hover:scale-110" />
              <div>
                <span className="text-2xl font-display font-bold text-lab-white group-hover:text-lab-blue transition-colors duration-300">BlockStar</span>
                <p className="text-xs text-lab-grey-dark">I have knowledge of Blockchain and Stacks</p>
              </div>
            </div>

            {isConnected ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-lab-blue bg-lab-blue/10 px-3 py-1.5 rounded-lg">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnect}
                  className="border-lab-blue/50 text-lab-blue hover:bg-lab-blue hover:text-lab-black hover:scale-105 hover:shadow-lg hover:shadow-lab-blue/20 transition-all duration-300"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={connect}
                className="gap-2 bg-lab-blue text-lab-black hover:bg-lab-purple font-semibold shadow-lg shadow-lab-blue/30 hover:shadow-xl hover:shadow-lab-blue/40 hover:scale-105 transition-all duration-300"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8 max-w-4xl mx-auto relative">
          {/* Decorative glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-lab-blue/5 rounded-full blur-3xl -z-10"></div>

          {/* Logo/Title */}
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-4 animate-reveal">
              <Blocks className="w-20 h-20 text-lab-blue drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-pulse" />
              <h1 className="text-7xl font-display font-bold bg-gradient-to-r from-lab-white via-lab-blue to-lab-white bg-clip-text text-transparent">
                BlockStar
              </h1>
            </div>
            <p className="text-3xl font-display text-lab-blue drop-shadow-[0_0_10px_rgba(99,102,241,0.3)]">
              I have knowledge of Blockchain and Stacks
            </p>
            <p className="text-xl text-lab-grey max-w-2xl mx-auto leading-relaxed">
              Master blockchain concepts through interactive quizzes and earn Bitcoin rewards.
              A Web3 educational platform building the next generation of blockchain developers.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link href="/create" className="group">
              <Button
                size="lg"
                className="gap-2 min-w-[220px] cursor-pointer bg-lab-blue text-lab-black hover:bg-lab-purple font-semibold shadow-lg shadow-lab-blue/30 hover:shadow-2xl hover:shadow-lab-blue/50 hover:scale-105 transition-all duration-300 group-hover:gap-3"
              >
                <BookOpen className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                Create Learning Session
              </Button>
            </Link>
            <Link href="/join" className="group">
              <Button
                size="lg"
                className="gap-2 min-w-[220px] cursor-pointer bg-lab-blue/10 text-lab-blue hover:bg-lab-blue hover:text-lab-black font-semibold border border-lab-blue/50 hover:border-lab-blue hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-lab-blue/20 transition-all duration-300 group-hover:gap-3"
              >
                <Users className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                Join Session
              </Button>
            </Link>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-32 relative">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-lab-blue/5 to-transparent blur-3xl -z-10"></div>

          <h2 className="text-5xl font-display font-bold text-center mb-4 text-lab-white">Your Learning Journey</h2>
          <p className="text-center text-lab-grey-dark mb-16 text-lg">Three simple steps to blockchain mastery</p>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Step 1 */}
            <Card className="group bg-gradient-to-br from-[#0F1629] to-[#080D1F] shadow-xl hover:shadow-2xl hover:shadow-lab-blue/10 hover:-translate-y-2 transition-all duration-500 border-0 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-lab-blue/0 to-lab-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 space-y-4 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-lab-blue to-lab-blue-dark flex items-center justify-center rounded-xl shadow-lg shadow-lab-blue/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Wallet className="w-8 h-8 text-lab-black" />
                </div>
                <h3 className="text-2xl font-display font-bold text-lab-white group-hover:text-lab-blue transition-colors duration-300">1. Connect</h3>
                <p className="text-lab-grey leading-relaxed">
                  Link your Stacks wallet (Leather or Xverse) to begin your Web3 learning journey. Your rewards are stored on-chain.
                </p>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="group bg-gradient-to-br from-[#0F1629] to-[#080D1F] shadow-xl hover:shadow-2xl hover:shadow-lab-blue/10 hover:-translate-y-2 transition-all duration-500 border-0 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-lab-blue/0 to-lab-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 space-y-4 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-lab-blue to-lab-blue-dark flex items-center justify-center rounded-xl shadow-lg shadow-lab-blue/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <GraduationCap className="w-8 h-8 text-lab-black" />
                </div>
                <h3 className="text-2xl font-display font-bold text-lab-white group-hover:text-lab-blue transition-colors duration-300">2. Learn</h3>
                <p className="text-lab-grey leading-relaxed">
                  Test your blockchain knowledge through real-time quizzes. Fast, accurate answers demonstrate true understanding.
                </p>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="group bg-gradient-to-br from-[#0F1629] to-[#080D1F] shadow-xl hover:shadow-2xl hover:shadow-lab-blue/10 hover:-translate-y-2 transition-all duration-500 border-0 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-lab-blue/0 to-lab-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="p-8 space-y-4 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-lab-blue to-lab-blue-dark flex items-center justify-center rounded-xl shadow-lg shadow-lab-blue/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Trophy className="w-8 h-8 text-lab-black" />
                </div>
                <h3 className="text-2xl font-display font-bold text-lab-white group-hover:text-lab-blue transition-colors duration-300">3. Earn</h3>
                <p className="text-lab-grey leading-relaxed">
                  Top performers receive Bitcoin rewards via smart contracts. 50% to 1st, 30% to 2nd, 20% to 3rd place.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-32 max-w-6xl mx-auto">
          <h2 className="text-5xl font-display font-bold text-center mb-4 text-lab-white">Why BlockStar?</h2>
          <p className="text-center text-lab-grey-dark mb-16 text-lg">Blockchain education reimagined for the Web3 era</p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="group flex gap-4 p-8 bg-gradient-to-br from-[#0F1629] to-[#080D1F] rounded-2xl shadow-lg hover:shadow-xl hover:shadow-lab-blue/5 hover:-translate-y-1 transition-all duration-300">
              <BookOpen className="w-10 h-10 text-lab-blue flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
              <div>
                <h3 className="text-xl font-display font-semibold mb-2 text-lab-white group-hover:text-lab-blue transition-colors duration-300">Educational Focus</h3>
                <p className="text-lab-grey leading-relaxed">
                  Designed for students and developers learning blockchain technology. Master concepts through active participation.
                </p>
              </div>
            </div>

            <div className="group flex gap-4 p-8 bg-gradient-to-br from-[#0F1629] to-[#080D1F] rounded-2xl shadow-lg hover:shadow-xl hover:shadow-lab-blue/5 hover:-translate-y-1 transition-all duration-300">
              <Shield className="w-10 h-10 text-lab-blue flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
              <div>
                <h3 className="text-xl font-display font-semibold mb-2 text-lab-white group-hover:text-lab-blue transition-colors duration-300">Blockchain-Native</h3>
                <p className="text-lab-grey leading-relaxed">
                  Built on Stacks, secured by Bitcoin. All rewards are distributed via smart contracts with complete transparency.
                </p>
              </div>
            </div>

            <div className="group flex gap-4 p-8 bg-gradient-to-br from-[#0F1629] to-[#080D1F] rounded-2xl shadow-lg hover:shadow-xl hover:shadow-lab-blue/5 hover:-translate-y-1 transition-all duration-300">
              <Network className="w-10 h-10 text-lab-blue flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
              <div>
                <h3 className="text-xl font-display font-semibold mb-2 text-lab-white group-hover:text-lab-blue transition-colors duration-300">Real-Time Learning</h3>
                <p className="text-lab-grey leading-relaxed">
                  Instant feedback on your knowledge. Watch your progress in real-time as you compete with peers.
                </p>
              </div>
            </div>

            <div className="group flex gap-4 p-8 bg-gradient-to-br from-[#0F1629] to-[#080D1F] rounded-2xl shadow-lg hover:shadow-xl hover:shadow-lab-blue/5 hover:-translate-y-1 transition-all duration-300">
              <Trophy className="w-10 h-10 text-lab-blue flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300" />
              <div>
                <h3 className="text-xl font-display font-semibold mb-2 text-lab-white group-hover:text-lab-blue transition-colors duration-300">Earn While Learning</h3>
                <p className="text-lab-grey leading-relaxed">
                  Bitcoin rewards for top performers. Your blockchain knowledge directly translates to real cryptocurrency earnings.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-32 mb-20 text-center space-y-8 relative">
          {/* Decorative line with glow */}
          <div className="relative mb-12">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-lab-blue/30 to-transparent"></div>
            </div>
            <div className="relative flex justify-center">
              <div className="w-12 h-12 bg-gradient-to-br from-lab-blue to-lab-blue-dark rounded-full flex items-center justify-center shadow-lg shadow-lab-blue/30">
                <Blocks className="w-6 h-6 text-lab-black" />
              </div>
            </div>
          </div>

          <h2 className="text-5xl font-display font-bold text-lab-white mb-3">Start Your Journey</h2>
          <p className="text-lab-grey text-lg">Join the next generation of blockchain builders</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Link href="/create" className="group">
              <Button
                size="lg"
                className="gap-2 min-w-[220px] cursor-pointer bg-lab-blue text-lab-black hover:bg-lab-purple font-semibold shadow-lg shadow-lab-blue/30 hover:shadow-2xl hover:shadow-lab-blue/50 hover:scale-105 transition-all duration-300 group-hover:gap-3"
              >
                <BookOpen className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                Create Session
              </Button>
            </Link>
            <Link href="/join" className="group">
              <Button
                size="lg"
                className="gap-2 min-w-[220px] cursor-pointer bg-lab-blue/10 text-lab-blue hover:bg-lab-blue hover:text-lab-black font-semibold border border-lab-blue/50 hover:border-lab-blue hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-lab-blue/20 transition-all duration-300 group-hover:gap-3"
              >
                <Users className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                Join Session
              </Button>
            </Link>
          </div>

          {/* Footer Attribution */}
          <div className="flex items-center justify-center gap-2 text-sm text-lab-grey-dark pt-12">
            <Network className="w-4 h-4 text-lab-blue" />
            <span className="text-lab-grey">Built on Stacks • Bitcoin Layer 2</span>
            <span className="text-lab-grey-dark">•</span>
            <span className="text-lab-grey">Built for <a href="https://www.letafricabuild.com/" target="_blank" rel="noopener noreferrer" className="text-lab-blue font-semibold hover:text-lab-purple transition-colors duration-300 cursor-pointer">Let Africa Build</a></span>
          </div>
        </div>
      </div>
    </div>
  );
}
