
"use client";

import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppContext, Goal } from "@/contexts/app-context";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const difficultyLevels = ['Beginner', 'Intermediate', 'Advanced', 'Hacker', 'Godly'] as const;

const formSchema = z.object({
  goal: z.string().min(10, "Your goal should be at least 10 characters long."),
  difficulty: z.enum(difficultyLevels),
});

type FormValues = z.infer<typeof formSchema>;

export function GoalSetter({ isUpdate = false, onGoalAdded }: { isUpdate?: boolean, onGoalAdded?: () => void }) {
  const { setGoals, goals, setActiveGoal } = useAppContext();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goal: "",
      difficulty: 'Beginner',
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    if (goals.some(g => g.description === data.goal)) {
        toast({
            variant: "destructive",
            title: "Goal Already Exists",
            description: "You already have this goal in your list.",
        });
        return;
    }
    const newGoal: Goal = { description: data.goal, difficulty: data.difficulty, completedChallenges: 0 };
    const newGoals = [...goals, newGoal];
    setGoals(newGoals);
    setActiveGoal(newGoal); // Set the new goal as active
    toast({
        title: "Goal Added!",
        description: `Your new active goal is: ${data.goal}`,
    });
    form.reset();
    if(onGoalAdded) {
      onGoalAdded();
    }
  };

  const cardContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="goal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Goal</FormLabel>
              <FormControl>
                <Input
                  id="goal"
                  placeholder="e.g., 'Learn Python', 'Read 10 books'"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="difficulty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Difficulty</FormLabel>
               <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a difficulty" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Beginner">🥲 Beginner</SelectItem>
                  <SelectItem value="Intermediate">🧐 Intermediate</SelectItem>
                  <SelectItem value="Advanced">🤓 Advanced</SelectItem>
                  <SelectItem value="Hacker">😎 Hacker</SelectItem>
                  <SelectItem value="Godly">🤯 Godly</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                This will help us tailor the challenges for you.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {isUpdate ? "Add Goal" : "Start My Journey"}
        </Button>
      </form>
    </Form>
  );

  if (isUpdate) {
    return cardContent;
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-headline">
          What is your first goal?
        </CardTitle>
        <CardDescription>
          Define your first goal, and we'll forge a path to victory, one challenge at a time.
        </CardDescription>
      </CardHeader>
      <CardContent>{cardContent}</CardContent>
    </Card>
  );
}
