
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getTestQuestions } from "@/lib/actions";
import type { GenerateTestQuestionsOutput } from "@/ai/schemas";
import { Skeleton } from "./ui/skeleton";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { cn } from "@/lib/utils";
import { AlertCircle, PartyPopper } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TestModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  topic?: string;
  onTestFinish: (score: number) => void;
}

type TestState = "idle" | "loading" | "testing" | "results" | "error";

export function TestModal({ isOpen, onOpenChange, topic: initialTopic, onTestFinish }: TestModalProps) {
  const [topic, setTopic] = useState(initialTopic || "");
  const [questions, setQuestions] = useState<GenerateTestQuestionsOutput["questions"]>([]);
  const [testState, setTestState] = useState<TestState>("idle");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setTestState(initialTopic ? "loading" : "idle");
      setTopic(initialTopic || "");
      setQuestions([]);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setSelectedAnswer(null);
      setScore(0);

      if (initialTopic) {
        handleStartTest(initialTopic);
      }
    }
  }, [isOpen, initialTopic]);

  const handleStartTest = async (currentTopic: string) => {
    if (!currentTopic) {
      toast({ variant: 'destructive', title: 'Topic needed', description: 'Please enter a topic for the test.', duration: 2000 });
      return;
    }
    setTestState("loading");
    const result = await getTestQuestions({ topic: currentTopic });
    if (result.success && result.success.questions.length > 0) {
      setQuestions(result.success.questions);
      setTestState("testing");
    } else {
      setTestState("error");
    }
  };
  
  const handleNextQuestion = () => {
    if (selectedAnswer === null) {
      toast({ variant: 'destructive', title: 'No answer selected', description: 'Please choose an answer.', duration: 2000 });
      return;
    }

    const updatedAnswers = [...userAnswers, selectedAnswer];
    setUserAnswers(updatedAnswers);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      // End of test
      calculateScore(updatedAnswers);
      setTestState("results");
    }
  };

  const calculateScore = (finalAnswers: string[]) => {
    let correctCount = 0;
    questions.forEach((q, index) => {
        if(q.correctAnswer === finalAnswers[index]) {
            correctCount++;
        }
    });
    setScore(correctCount);
  }

  const handleClose = (finished: boolean) => {
    if (finished) {
        onTestFinish(score);
    }
    onOpenChange(false);
  }


  const renderContent = () => {
    switch (testState) {
      case "idle":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Knowledge Check</DialogTitle>
              <DialogDescription>What topic do you want to be tested on?</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., 'React Hooks', 'WWII History'"
              />
            </div>
            <DialogFooter>
              <Button onClick={() => handleStartTest(topic)}>Start Test</Button>
            </DialogFooter>
          </>
        );

      case "loading":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Generating Your Test...</DialogTitle>
              <DialogDescription>Please wait while we prepare your questions.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Skeleton className="h-8 w-3/4" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            </div>
          </>
        );
      
      case "error":
        return (
             <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-destructive-foreground">Failed to Create Test</h3>
                <p className="text-destructive-foreground/80 mb-4">We couldn't generate questions for that topic. Please try a different one.</p>
                <Button onClick={() => setTestState('idle')} variant="destructive">Try Again</Button>
            </div>
        );

      case "testing":
        const currentQuestion = questions[currentQuestionIndex];
        return (
          <>
            <DialogHeader>
                <DialogTitle>Question {currentQuestionIndex + 1} / {questions.length}</DialogTitle>
                <DialogDescription>{currentQuestion.question}</DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <RadioGroup value={selectedAnswer ?? undefined} onValueChange={setSelectedAnswer}>
                    {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`option-${index}`} />
                            <Label htmlFor={`option-${index}`}>{option}</Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>
            <DialogFooter>
                <Button onClick={handleNextQuestion}>
                    {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Test"}
                </Button>
            </DialogFooter>
          </>
        );
    
      case "results":
        return (
            <div className="text-center py-8">
                <PartyPopper className="h-16 w-16 text-primary mx-auto mb-4" />
                <DialogTitle className="text-2xl mb-2">Test Complete!</DialogTitle>
                <DialogDescription className="text-lg">
                    You scored
                </DialogDescription>
                <p className="text-4xl font-bold my-2">{score} / {questions.length}</p>
                <Button onClick={() => handleClose(true)} className="mt-4">Claim Your Reward & Close</Button>
            </div>
        )
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose(testState === 'results')}>
      <DialogContent className="sm:max-w-[425px]">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
