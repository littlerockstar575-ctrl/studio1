"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppContext } from "@/contexts/app-context";
import { getDailyChallenge } from "@/lib/actions";
import { PartyPopper, RefreshCw, AlertCircle } from "lucide-react";

const CHALLENGE_DURATION = 10; // 10 seconds for demo

export function DailyChallengeCard() {
  const { goal, setCoins, setStreak } = useAppContext();
  const [challenge, setChallenge] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCompletable, setIsCompletable] = useState(false);
  const [progress, setProgress] = useState(0);

  const fetchChallenge = useCallback(async () => {
    if (!goal) return;
    setIsLoading(true);
    setError(null);
    setChallenge(null);
    setIsCompleted(false);
    setIsCompletable(false);
    setProgress(0);
    
    const result = await getDailyChallenge({ goal });
    if (result.success) {
      setChallenge(result.success);
    } else {
      setError(result.failure || "An unknown error occurred.");
    }
    setIsLoading(false);
  }, [goal]);

  useEffect(() => {
    fetchChallenge();
  }, [fetchChallenge]);
  
  useEffect(() => {
    if (isLoading || isCompleted || !challenge) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsCompletable(true);
          return 100;
        }
        return prev + 100 / CHALLENGE_DURATION;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading, isCompleted, challenge]);


  const handleComplete = () => {
    if (!isCompletable) return;
    setIsCompleted(true);
    setCoins(c => c + 100);
    setStreak(s => s + 1);
  };

  const handleNewChallenge = () => {
    fetchChallenge();
  };

  if (isLoading) {
    return (
      <Card className="flex flex-col justify-center items-center h-80">
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent className="w-full px-6 space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </CardContent>
        <CardFooter className="w-full px-6">
            <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    );
  }

  if (error) {
    return (
        <Card className="flex flex-col justify-center items-center h-80 bg-destructive/10 border-destructive">
            <CardContent className="text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                <h3 className="text-xl font-semibold text-destructive-foreground">Failed to Forge Challenge</h3>
                <p className="text-destructive-foreground/80">{error}</p>
                <Button onClick={handleNewChallenge} variant="destructive">
                    <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                </Button>
            </CardContent>
      </Card>
    )
  }

  if (isCompleted) {
    return (
        <Card className="flex flex-col justify-center items-center h-80 bg-accent/20 border-accent">
            <CardContent className="text-center space-y-4">
                <PartyPopper className="h-16 w-16 text-primary mx-auto" />
                <h3 className="text-2xl font-bold text-accent-foreground">Challenge Complete!</h3>
                <p className="text-accent-foreground/80">You've earned 100 coins and extended your streak!</p>
                <Button onClick={handleNewChallenge}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Forge a New Challenge
                </Button>
            </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-80">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Today's Quest</CardTitle>
        <CardDescription>A small step towards your goal: {goal}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center">
        <p className="text-xl md:text-2xl font-medium text-center text-foreground/90">{challenge}</p>
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <div className="w-full space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-center text-muted-foreground">
                {isCompletable ? "Ready to complete!" : `Challenge unlocks in ${Math.max(0, CHALLENGE_DURATION - Math.floor(progress / (100/CHALLENGE_DURATION)))}s`}
            </p>
        </div>
        <Button onClick={handleComplete} disabled={!isCompletable} size="lg" className="w-full">
          Complete Challenge
        </Button>
      </CardFooter>
    </Card>
  );
}
