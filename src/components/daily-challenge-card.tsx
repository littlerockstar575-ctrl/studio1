
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppContext } from "@/contexts/app-context";
import { getDailyChallenge, getPythonFact, getClassifiedGoal, validateCode, getCompletionThought, getChallengeHint } from "@/lib/actions";
import { PartyPopper, RefreshCw, AlertCircle, Code, BookOpen, BrainCircuit, ShieldCheck, Lightbulb, Loader2 } from "lucide-react";
import { CodeEditor } from "./code-editor";
import { toast } from "@/hooks/use-toast";
import { TestModal } from "./test-modal";
import { setDoc, doc } from "firebase/firestore";
import { useFirestore } from "@/firebase/provider";
import { isToday, isYesterday, formatISO } from 'date-fns';


const CHALLENGE_DURATION_STUDY = 30 * 60; // 30 minutes for study challenge
const TEST_INTERVAL = 5; // Show test after every 5 challenges
const HINT_COST = 500;

type ChallengeType = 'coding' | 'study' | 'other';

export function DailyChallengeCard() {
  const { activeGoal, userProfile, user } = useAppContext();
  const firestore = useFirestore();
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
  const [completionThought, setCompletionThought] = useState<string | null>(null);
  const [isThoughtLoading, setIsThoughtLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);

  const userDocRef = user ? doc(firestore, "users", user.uid) : undefined;


  const fetchChallenge = useCallback(async () => {
    if (!activeGoal) return;

    setIsLoading(true);
    setError(null);
    setChallenge(null);
    setProgress(0);
    setUserCode("");
    setPythonFact(null);
    setCompletionThought(null);
    setIsCompletable(false);
    setHint(null);
    
    const classificationResult = await getClassifiedGoal(activeGoal.description);

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

    const result = await getDailyChallenge({ goal: activeGoal.description, difficulty: activeGoal.difficulty, completedChallenges: activeGoal.completedChallenges });
    if (result.success) {
      setChallenge(result.success);
    } else {
      setError(result.failure || "An unknown error occurred.");
    }
    setIsLoading(false);
  }, [activeGoal]);

  useEffect(() => {
    if (activeGoal) {
      fetchChallenge();
    }
  }, [fetchChallenge, activeGoal]);
  
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
  
  const handleCompletion = useCallback(async () => {
    if (!activeGoal || !userProfile || !userDocRef) return;

    const today = new Date();
    const lastDate = userProfile.lastChallengeDate ? new Date(userProfile.lastChallengeDate) : null;
    let newStreak = userProfile.streak;
    let shouldUpdateStreakDate = false;

    // Only update streak logic if it's a new day
    if (!lastDate || !isToday(lastDate)) {
      shouldUpdateStreakDate = true;
      if (lastDate && isYesterday(lastDate)) {
        newStreak += 1; // It was yesterday, increment streak
      } else {
        newStreak = 1; // It wasn't yesterday or it's the first time, reset to 1
      }
    }

    const reward = challengeType === 'coding' ? 150 : 100;
    const newCoins = userProfile.coins + reward;

    const updatedGoal = { ...activeGoal, completedChallenges: activeGoal.completedChallenges + 1 };
    const newGoals = userProfile.goals.map(g => g.description === updatedGoal.description ? updatedGoal : g);

    const updateData: Partial<any> = {
      coins: newCoins,
      streak: newStreak,
      goals: newGoals,
      activeGoalDescription: activeGoal.description,
    };

    if (shouldUpdateStreakDate) {
      updateData.lastChallengeDate = formatISO(today, { representation: 'date' });
    }

    await setDoc(userDocRef, updateData, { merge: true });

    setIsCompleted(true);
    setIsThoughtLoading(true);
    setIsFactLoading(true);

    const [thoughtResult, factResult] = await Promise.all([
        activeGoal && challenge ? getCompletionThought({ goal: activeGoal.description, challenge }) : Promise.resolve(null),
        challengeType === 'coding' && language === 'python' ? getPythonFact() : Promise.resolve(null)
    ]);

    if (thoughtResult?.success) {
        setCompletionThought(thoughtResult.success);
    } else {
        setCompletionThought("Every step forward is a victory.");
    }
    setIsThoughtLoading(false);

    if (factResult?.success) {
        setPythonFact(factResult.success);
    }
    setIsFactLoading(false);

  }, [activeGoal, challenge, challengeType, language, userProfile, userDocRef]);


  const handleComplete = async () => {
    if (challengeType === 'coding') {
        if (!challenge || !userCode || userCode.trim() === "" || userCode.trim() === placeholderCode.trim()) {
             toast({ variant: 'destructive', title: "Not Quite", description: "Please write some code before submitting!", duration: 2000 });
             return;
        }
        setIsValidating(true);
        const validationResult = await validateCode({ challenge, code: userCode, language });
        setIsValidating(false);

        if (validationResult.success && validationResult.success.isValid) {
            toast({ title: "Challenge Done!", description: "Great job! Your code was accepted.", duration: 2000 });
            await handleCompletion();
        } else {
            toast({ variant: 'destructive', title: "Not Quite Right", description: validationResult.success?.reason || validationResult.failure || "Your code doesn't seem to solve the challenge. Please try again.", duration: 2000 });
        }
        return;
    }

    if (!isCompletable) return;
    await handleCompletion();
  };

  const handleNewChallenge = () => {
    setIsCompleted(false);
    fetchChallenge();
  };

  const onTestFinish = (score: number) => {
    const bonus = score * 50; 
    if (userDocRef && userProfile) {
        setDoc(userDocRef, { coins: userProfile.coins + bonus }, { merge: true });
    }
    toast({
        title: "Test Complete!",
        description: `You scored ${score} and earned a bonus of ${bonus} coins!`,
        duration: 2000,
    })
  }

  const handleGetHint = async () => {
    if (!activeGoal || !challenge || !userProfile || userProfile.coins < HINT_COST || !userDocRef) return;
    
    setIsHintLoading(true);
    await setDoc(userDocRef, { coins: userProfile.coins - HINT_COST }, { merge: true });

    const result = await getChallengeHint({
      goal: activeGoal.description,
      challenge: challenge,
      language: challengeType === 'coding' ? language : undefined,
    });

    if (result.success) {
      setHint(result.success);
    } else {
      setHint("Sorry, couldn't generate a hint right now. Your coins were not spent.");
      await setDoc(userDocRef, { coins: userProfile.coins }, { merge: true }); // refund
    }
    setIsHintLoading(false);
  };


  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  const showTestButton = activeGoal && activeGoal.completedChallenges > 0 && activeGoal.completedChallenges % TEST_INTERVAL === 0;
  const challengesUntilTest = activeGoal ? TEST_INTERVAL - (activeGoal.completedChallenges % TEST_INTERVAL) : TEST_INTERVAL;


  if (isLoading || !userProfile) {
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
                <Button onClick={fetchChallenge} variant="destructive">
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
                
                <p className="text-accent-foreground/80">{`You've earned ${challengeType === 'coding' ? 150 : 100} coins!`}</p>
                
                {isThoughtLoading ? (
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                ) : (
                    completionThought && <p className="text-lg italic text-accent-foreground/90">"{completionThought}"</p>
                )}

                {challengeType === 'coding' && language === 'python' && (
                  <div className="p-4 bg-background/50 rounded-lg text-sm text-center italic space-y-3">
                    <div className="flex items-center justify-center gap-2 font-semibold">
                      <Lightbulb className="h-5 w-5 text-yellow-400" />
                      Python Fact
                    </div>
                    {isFactLoading ? <Skeleton className="h-5 w-full" /> : <p>"{pythonFact}"</p>}
                  </div>
                )}
                
                <div className="flex gap-4 justify-center pt-4">
                    <Button onClick={handleNewChallenge}>
                        <RefreshCw className="mr-2 h-4 w-4" /> Forge Next Challenge
                    </Button>
                </div>

                 {showTestButton ? (
                     <Button variant="outline" onClick={() => setIsTestModalOpen(true)} className="mt-2">
                        <BrainCircuit className="mr-2 h-4 w-4" /> Take a Bonus Test
                    </Button>
                ) : (
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-2 pt-2">
                        <ShieldCheck className="h-4 w-4" />
                        <span>{challengesUntilTest} more challenge{challengesUntilTest > 1 ? 's' : ''} until the next test.</span>
                    </div>
                )}
            </CardContent>
            {activeGoal && (
              <TestModal 
                isOpen={isTestModalOpen} 
                onOpenChange={setIsTestModalOpen}
                topic={challengeType === 'coding' ? activeGoal.description : undefined}
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
        <CardDescription>A small step towards your goal: {activeGoal?.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center gap-4">
        <p className="text-xl md:text-2xl font-medium text-center text-foreground/90">{challenge}</p>
        
        {hint && (
            <div className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <p className="text-sm text-blue-800 italic">
                    <Lightbulb className="inline-block h-4 w-4 mr-2" />
                    {hint}
                </p>
            </div>
        )}

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

        <div className="w-full flex items-center gap-2">
            <Button onClick={handleComplete} disabled={!isCompletable || isValidating} size="lg" className="w-full">
              {isValidating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isValidating ? 'Validating...' : (challengeType === 'coding' ? "Submit Code" : "Complete Challenge")}
            </Button>

            {!hint && !isCompleted && challengeType === 'coding' && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button 
                            variant="outline" 
                            size="lg" 
                            disabled={isHintLoading || (userProfile?.coins ?? 0) < HINT_COST}
                            className="shrink-0"
                        >
                            <Lightbulb className="h-5 w-5" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Need a little help?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Get a hint for this challenge. It will cost <strong className="text-primary">{HINT_COST} coins</strong>.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleGetHint}>Get Hint</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
      </CardFooter>
    </Card>
  );
}

    