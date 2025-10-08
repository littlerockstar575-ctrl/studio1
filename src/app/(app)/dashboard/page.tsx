"use client";

import { useAppContext } from "@/contexts/app-context";
import { GoalSetter } from "@/components/goal-setter";
import { DailyChallengeCard } from "@/components/daily-challenge-card";
import { Flame, Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { activeGoal, coins, streak } = useAppContext();

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
                        <CardTitle>Your Active Goal</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-medium text-primary-foreground/80">{activeGoal}</p>
                    </CardContent>
                </Card>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
