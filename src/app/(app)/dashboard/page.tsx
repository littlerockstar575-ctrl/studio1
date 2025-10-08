
"use client";

import { useAppContext } from "@/contexts/app-context";
import { GoalSetter } from "@/components/goal-setter";
import { DailyChallengeCard } from "@/components/daily-challenge-card";
import { Flame, Coins, PlusCircle, Trash2, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

export default function DashboardPage() {
  const { activeGoal, goals, setActiveGoal, setGoals, coins, streak } = useAppContext();
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);


  const removeGoal = (goalToRemove: string) => {
    setGoals(goals.filter(g => g !== goalToRemove));
    if (activeGoal === goalToRemove) {
      const newActiveGoal = goals.filter(g => g !== goalToRemove)[0] || null;
      setActiveGoal(newActiveGoal);
    }
  };

  return (
    <>
      {!activeGoal ? (
        <div className="flex h-full items-center justify-center">
            <GoalSetter />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold md:text-3xl font-headline text-primary-foreground/90">Forge Your Path</h1>
            <div className="flex gap-4">
                <div className="flex items-center gap-2 rounded-lg bg-card px-3 py-1.5 shadow-sm">
                    <Flame className="w-5 h-5 text-primary" />
                    <span className="font-bold">{streak}</span>
                    <span className="text-sm text-muted-foreground">Streak</span>
                </div>
                 <div className="flex items-center gap-2 rounded-lg bg-card px-3 py-1.5 shadow-sm">
                    <Coins className="w-5 h-5 text-primary" />
                    <span className="font-bold">{coins.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">Coins</span>
                </div>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
                <DailyChallengeCard />
            </div>
            <div className="md:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Goals</CardTitle>
                        <CardDescription>Add, remove, or switch your active goal.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       {goals.map(goal => (
                            <div key={goal} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                <p className="font-medium text-sm flex-1 pr-2">{goal}</p>
                                <div className="flex items-center gap-1">
                                    <Button 
                                        variant={activeGoal === goal ? "default" : "outline"} 
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setActiveGoal(goal)}
                                        disabled={activeGoal === goal}
                                    >
                                        <Star className="w-4 h-4" />
                                    </Button>
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="icon" className="h-8 w-8">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete this goal.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => removeGoal(goal)}>Continue</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        ))}
                         <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
                            <DialogTrigger asChild>
                                 <Button variant="outline" className="w-full mt-4">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add New Goal
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                <DialogTitle>Add a New Goal</DialogTitle>
                                <DialogDescription>
                                    Expand your horizons by adding a new goal to your list.
                                </DialogDescription>
                                </DialogHeader>
                                <GoalSetter isUpdate={true} onGoalAdded={() => setIsAddGoalOpen(false)} />
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
