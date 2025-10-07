
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
import { getDailyChallenge, getPythonFact, getClassifiedGoal, validateCode } from "@/lib/actions";
import { PartyPopper, RefreshCw, AlertCircle, Code, BookOpen, BrainCircuit, ShieldCheck, Lightbulb, Loader2 } from "lucide-react";
import { CodeEditor } from "./code-editor";
import { toast } from "@/hooks/use-toast";
import type { GenerateTestQuestionsOutput } from "@/ai/schemas";
import { TestModal } from "./test-modal";


const CHALLENGE_DURATION_STUDY = 30 * 60; // 30 minutes for study challenge
const TEST_INTERVAL = 5; // Show test after every 5 challenges

type ChallengeType = 'coding' | 'study' | 'other';

export function DailyChallengeCard() {
  const { goal, setCoins, setStreak, streak, completedChallenges, setCompletedChallenges } = useAppContext();
  const [challenge, setChallenge] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCompletable, setIsCompletable] = useState(false);
  const [progress, setProgress] = useState(0);
  const [challengeType, setChallengeType] = useState<ChallengeType>('other');
  const [userCode, setUserCode] = useState("");
  const [timer, setTimer] = useState(CHALLENGE_DURATION_STUDY);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [pythonFact, setPythonFact] = useState<string | null>(null);
  const [isFactLoading, setIsFactLoading] = useState(false);
  const [language, setLanguage] = useState('javascript');
  const [placeholderCode, setPlaceholderCode] = useState("");


  const fetchChallenge = useCallback(async () => {
    if (!goal) return;
    setIsLoading(true);
    setError(null);
    setChallenge(null);
    setIsCompleted(false);
    setIsCompletable(false);
    setProgress(0);
    setUserCode("");
    setPythonFact(null);
    
    const classificationResult = await getClassifiedGoal(goal);

    let type: ChallengeType = 'other';
    let detectedLanguage: string | undefined;

    if (classificationResult.success) {
        type = classificationResult.success.type;
        detectedLanguage = classificationResult.success.language;
    } else {
        setError("Could not understand your goal. Please try rephrasing it in settings.");
        setIsLoading(false);
        return;
    }

    setChallengeType(type);
    if (type === 'coding') {
        const lang = detectedLanguage || 'javascript';
        const placeholder = `// write your ${lang} code here`;
        setLanguage(lang);
        setUserCode(placeholder);
        setPlaceholderCode(placeholder);
        setIsCompletable(true);
    } else if (type === 'study') {
        setTimer(CHALLENGE_DURATION_STUDY);
    } else {
        setTimer(10); 
    }

    const result = await getDailyChallenge({ goal, completedChallenges });
    if (result.success) {
      setChallenge(result.success);
    } else {
      setError(result.failure || "An unknown error occurred.");
    }
    setIsLoading(false);
  }, [goal, completedChallenges]);

  useEffect(() => {
    fetchChallenge();
  }, [fetchChallenge]);
  
  useEffect(() => {
    if (isLoading || isCompleted || !challenge || challengeType === 'coding') return;

    const duration = challengeType === 'study' ? CHALLENGE_DURATION_STUDY : 10;
    setIsCompletable(false);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCompletable(true);
          return 100;
        }
        return prev + 100 / duration;
      });
      if(challengeType === 'study'){
        setTimer(t => Math.max(0, t - 1));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading, isCompleted, challenge, challengeType]);

  const handleFetchFact = async () => {
    if (language !== 'python') return;

    setIsFactLoading(true);
    const result = await getPythonFact();
    if (result.success) {
      setPythonFact(result.success);
    } else {
      setPythonFact("Could not fetch a fun fact. Maybe try again?");
    }
    setIsFactLoading(false);
  }

  const handleComplete = async () => {
    if (challengeType === 'coding') {
        // Check if there is no code or if the code is just the initial placeholder
        if (!challenge || !userCode || userCode.trim() === "" || userCode.trim() === placeholderCode.trim()) {
             toast({ variant: 'destructive', title: "Not Quite", description: "Please write some code before submitting!" });
             return;
        }
        setIsValidating(true);
        const validationResult = await validateCode({ challenge, code: userCode, language });
        setIsValidating(false);

        if (validationResult.success && validationResult.success.isValid) {
            setIsCompleted(true);
            setCoins(c => c + 150);
            setStreak(s => s + 1);
            setCompletedChallenges(c => c + 1);
            toast({ title: "Challenge Done!", description: "Great job! Your code was accepted." });
            handleFetchFact();
        } else {
            toast({ variant: 'destructive', title: "Not Quite Right", description: validationResult.success?.reason || validationResult.failure || "Your code doesn't seem to solve the challenge. Please try again." });
        }
        return;
    }

    if (!isCompletable) return;
    setIsCompleted(true);
    setCoins(c => c + 100);
    setStreak(s => s + 1);
    setCompletedChallenges(c => c + 1);
  };

  const handleNewChallenge = () => {
    fetchChallenge();
  };

  const onTestFinish = (score: number) => {
    const bonus = score * 50; 
    setCoins(c => c + bonus);
    toast({
        title: "Test Complete!",
        description: `You scored ${score} and earned a bonus of ${bonus} coins!`,
    })
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  const showTestButton = isCompleted && completedChallenges > 0 && completedChallenges % TEST_INTERVAL === 0;
  const challengesUntilTest = TEST_INTERVAL - (completedChallenges % TEST_INTERVAL);


  if (isLoading) {
    return (
      <Card className="flex flex-col justify-center items-center min-h-[24rem]">
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
        <Card className="flex flex-col justify-center items-center min-h-[24rem] bg-destructive/10 border-destructive">
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
        <Card className="flex flex-col justify-center items-center min-h-[24rem] bg-accent/20 border-accent">
            <CardContent className="text-center space-y-4">
                <PartyPopper className="h-16 w-16 text-primary mx-auto" />
                <h3 className="text-2xl font-bold text-accent-foreground">Challenge Complete!</h3>
                <p className="text-accent-foreground/80">You've earned {challengeType === 'coding' ? 150 : 100} coins and extended your streak!</p>
                
                {challengeType === 'coding' && pythonFact && (
                  <div className="p-4 bg-background/50 rounded-lg text-sm text-center italic space-y-3">
                    <div className="flex items-center justify-center gap-2 font-semibold">
                      <Lightbulb className="h-5 w-5 text-yellow-400" />
                      Python Fact
                    </div>
                    {isFactLoading ? <Skeleton className="h-5 w-full" /> : <p>"{pythonFact}"</p>}
                    <Button onClick={handleFetchFact} size="sm" variant="ghost" disabled={isFactLoading}>
                      <RefreshCw className={`mr-2 h-4 w-4 ${isFactLoading ? 'animate-spin' : ''}`} />
                      Show Another Fact
                    </Button>
                  </div>
                )}
                
                <div className="flex gap-4 justify-center">
                    <Button onClick={handleNewChallenge}>
                        <RefreshCw className="mr-2 h-4 w-4" /> Forge a New Challenge
                    </Button>
                    {showTestButton && (
                      <Button variant="outline" onClick={() => setIsTestModalOpen(true)}>
                          <BrainCircuit className="mr-2 h-4 w-4" /> Take a Test
                      </Button>
                    )}
                </div>
                 {!showTestButton && (
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-2 pt-2">
                        <ShieldCheck className="h-4 w-4" />
                        <span>{challengesUntilTest} more challenge{challengesUntilTest > 1 ? 's' : ''} until the next test.</span>
                    </div>
                )}
            </CardContent>
            {goal && (
              <TestModal 
                isOpen={isTestModalOpen} 
                onOpenChange={setIsTestModalOpen}
                topic={challengeType === 'coding' ? goal : undefined}
                onTestFinish={onTestFinish}
              />
            )}
      </Card>
    );
  }

  return (
    <Card className="flex flex-col min-h-[24rem]">
      <CardHeader>
        <CardTitle className="text-2xl font-headline flex items-center gap-2">
            {challengeType === 'coding' && <Code />}
            {challengeType === 'study' && <BookOpen />}
            Today's Quest
        </CardTitle>
        <CardDescription>A small step towards your goal: {goal}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center gap-4">
        <p className="text-xl md:text-2xl font-medium text-center text-foreground/90">{challenge}</p>
        {challengeType === 'coding' && (
            <div className="w-full">
                <CodeEditor code={userCode} setCode={setUserCode} language={language} />
            </div>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-4">
        {challengeType !== 'coding' && (
            <div className="w-full space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-center text-muted-foreground">
                    {challengeType === 'study' ? `Time remaining: ${formatTime(timer)}` : 
                    (isCompletable ? "Ready to complete!" : `Challenge unlocks in ${Math.max(0, 10 - Math.floor(progress / 10))}s`)
                    }
                </p>
            </div>
        )}
        <Button onClick={handleComplete} disabled={!isCompletable || isValidating} size="lg" className="w-full">
          {isValidating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isValidating ? 'Validating...' : (challengeType === 'coding' ? "Submit Code" : "Complete Challenge")}
        </Button>
      </CardFooter>
    </Card>
  );
}

    