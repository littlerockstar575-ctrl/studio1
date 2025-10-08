"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalSetter } from "@/components/goal-setter";
import { useAppContext } from "@/contexts/app-context";
import { Trash2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
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
} from "@/components/ui/alert-dialog"

export default function SettingsPage() {
    const { goals, setGoals, activeGoal, setActiveGoal } = useAppContext();

    const removeGoal = (goalToRemove: string) => {
        setGoals(goals.filter(g => g !== goalToRemove));
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">Settings</h1>
            </div>
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Add a New Goal</CardTitle>
                        <CardDescription>
                           Expand your horizons by adding a new goal to your list.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <GoalSetter isUpdate={true} />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Manage Your Goals</CardTitle>
                        <CardDescription>
                           Set your active goal or remove goals you're no longer pursuing.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {goals.length > 0 ? (
                            goals.map(goal => (
                                <div key={goal} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <p className="font-medium">{goal}</p>
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            variant={activeGoal === goal ? "default" : "outline"} 
                                            size="sm"
                                            onClick={() => setActiveGoal(goal)}
                                            disabled={activeGoal === goal}
                                        >
                                            <Star className="w-4 h-4 mr-2" />
                                            {activeGoal === goal ? "Active" : "Set Active"}
                                        </Button>
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="icon">
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
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center">You haven't added any goals yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
