
"use client";

import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppContext } from "@/contexts/app-context";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  goal: z.string().min(10, "Your goal should be at least 10 characters long."),
});

type FormValues = z.infer<typeof formSchema>;

export function GoalSetter({ isUpdate = false, onGoalAdded }: { isUpdate?: boolean, onGoalAdded?: () => void }) {
  const { setGoals, goals, setActiveGoal } = useAppContext();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goal: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    if (goals.includes(data.goal)) {
        toast({
            variant: "destructive",
            title: "Goal Already Exists",
            description: "You already have this goal in your list.",
        });
        return;
    }
    const newGoals = [...goals, data.goal];
    setGoals(newGoals);
    setActiveGoal(data.goal); // Set the new goal as active
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="goal"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="goal" className="sr-only">Your Goal</Label>
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
